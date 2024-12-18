import { PrismaClient } from '@prisma/client';
import ejs from 'ejs';
import fse from 'fs-extra';
import path from 'path';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import { WEEKLY_REPORT_UPLOAD_DIR } from '@/consts';
import { convertNumToString } from '@/utils/convertNumToString';

dayjs.extend(utcPlugin);

const prisma = new PrismaClient();

const generateWeeklyReport = async (all: boolean) => {
  let iStartDate = dayjs('2024-04-06', { utc: true }).startOf('week');
  if (!all) {
    const lastWeeklyReport = await prisma.weeklyReport.findFirst({
      orderBy: {
        weekStartDate: 'desc',
      },
    });

    if (lastWeeklyReport) {
      iStartDate = dayjs(lastWeeklyReport.weekStartDate, { utc: true }).add(1, 'week');
    }
  }

  const nowStartDate = dayjs().utc().startOf('week');
  for (
    iStartDate;
    iStartDate.isBefore(nowStartDate.toDate(), 'day');
    iStartDate = iStartDate.add(1, 'week')
  ) {
    console.log(`Generating Weekly Report, ${iStartDate.format('MM/DD/YYYY')}`);
    const sales = await prisma.sale.findMany({
      where: {
        orderedAt: {
          gte: iStartDate.toDate(),
          lt: iStartDate.add(1, 'week').toDate(),
        },
      },
      include: {
        package: {
          select: {
            productName: true,
            amount: true,
            token: true,
            point: true,
          },
        },
        member: {
          select: {
            fullName: true,
            assetId: true,
          },
        },
      },
      orderBy: {
        ID: 'desc',
      },
    });
    const commissions = await prisma.weeklyCommission.findMany({
      where: {
        weekStartDate: iStartDate.toDate(),
        commission: {
          gt: 0,
        },
      },
      include: {
        member: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        commission: 'desc',
      },
    });
    const proofs = await prisma.proof.findMany({
      where: {
        orderedAt: {
          gte: iStartDate.toDate(),
          lt: iStartDate.add(1, 'week').toDate(),
        },
        amount: {
          gt: 0,
        },
      },
    });

    const {
      hashPower: totalHashPower,
      revenue: totalRevenue,
      saleCnt,
    } = await prisma.$queryRaw<{ hashPower: number; revenue: number; saleCnt: number }[]>`
      SELECT SUM(packages.token)::Int as "hashPower", SUM(packages.amount)::Int as "revenue", COUNT(*)::Int as "saleCnt"
      FROM sales
      LEFT JOIN packages ON sales."packageId" = packages.id
      WHERE sales."orderedAt" < ${iStartDate.add(1, 'week').format('YYYY-MM-DD')}::Date
    `.then((res) => res[0]);

    const totalCommission = await prisma.$queryRaw<{ commission: number }[]>`
      SELECT SUM(weeklycommissions.commission) as commission
      FROM weeklycommissions
      WHERE weeklycommissions."weekStartDate" <= ${iStartDate.format('YYYY-MM-DD')}::Date
    `.then((res) => res[0].commission);

    const newRevenue = sales.reduce((prev, sale) => prev + sale.package.amount, 0);
    const newHash = sales.reduce((prev, sale) => prev + sale.package.token, 0);
    const newCommission = commissions.reduce((prev, cms) => prev + cms.commission, 0);
    const CENT_CONVERT = 1000;
    const newExpenses =
      proofs
        .filter((proof) => proof.type !== 'SALE' && proof.type !== 'PREPAY')
        .reduce((prev, proof) => prev + proof.amount * CENT_CONVERT, 0) / CENT_CONVERT;

    const date = `${iStartDate.add(1, 'week').format('dddd')}, ${iStartDate.format('MM/DD')}-${iStartDate.add(1, 'week').subtract(1, 'day').format('MM/DD, YYYY')}`;
    const top10Earners = await prisma.$queryRaw<
      { fullName: string; joinedAt: string; sponsor: number; earning: number }[]
    >`
      WITH earnings AS (
        SELECT "memberId", SUM(weeklycommissions.commission) as earning
        FROM weeklycommissions
        WHERE weeklycommissions."weekStartDate" <= ${iStartDate.format('YYYY-MM-DD')}::Date
        GROUP BY "memberId"
      ),
      sponsors AS (
        SELECT "sponsorId", COUNT(*) as sponsor
        FROM members
        WHERE members."createdAt" < ${iStartDate.add(1, 'week').format('YYYY-MM-DD')}::Date
        GROUP BY "sponsorId"
      )
      SELECT "fullName", TO_CHAR("createdAt", 'MM/DD/YYYY') AS "joinedAt", COALESCE("sponsor", 0) AS "sponsor", COALESCE("earning", 0) AS "earning"
      FROM members
      LEFT JOIN earnings ON members.id = earnings."memberId"
      LEFT JOIN sponsors ON members.id = sponsors."sponsorId"
      WHERE "members"."createdAt" < ${iStartDate.add(1, 'week').format('YYYY-MM-DD')}::Date
      ORDER BY earning DESC NULLS LAST
	    LIMIT 10
    `;

    const top10Sponsors = await prisma.$queryRaw<
      { fullName: string; joinedAt: string; sponsor: number; earning: number }[]
    >`
      WITH earnings AS (
        SELECT "memberId", SUM(weeklycommissions.commission) as earning
        FROM weeklycommissions
        WHERE weeklycommissions."weekStartDate" <= ${iStartDate.format('YYYY-MM-DD')}::Date
        GROUP BY "memberId"
      ),
      sponsors AS (
        SELECT "sponsorId", COUNT(*) as sponsor
        FROM members
        WHERE members."createdAt" < ${iStartDate.add(1, 'week').format('YYYY-MM-DD')}::Date
        GROUP BY "sponsorId"
      )
      SELECT "fullName", TO_CHAR("createdAt", 'MM/DD/YYYY') AS "joinedAt", COALESCE("sponsor", 0) AS "sponsor", COALESCE("earning", 0) AS "earning"
      FROM members
      LEFT JOIN earnings ON members.id = earnings."memberId"
      LEFT JOIN sponsors ON members.id = sponsors."sponsorId"
      WHERE "members"."createdAt" < ${iStartDate.add(1, 'week').format('YYYY-MM-DD')}::Date
      ORDER BY sponsor DESC NULLS LAST
      LIMIT 10
    `;

    const data = {
      date,
      newExpenses,
      retainedEarning: 0,
      bobbyEarning: 0,
      newRevenue: newRevenue.toLocaleString(),
      newHash,
      newCommission: newCommission.toLocaleString(),
      totalCommission: totalCommission.toLocaleString(),
      sales: sales.map((sale) => ({
        ...sale,
        package: {
          ...sale.package,
          amount: sale.package.amount.toLocaleString(),
        },
        ID: convertNumToString({
          value: sale.ID,
          length: 7,
          prefix: 'S',
        }),
        orderedAt: dayjs(sale.orderedAt, { utc: true }).format('MM/DD/YYYY'),
      })),
      totalHashPower,
      totalSale: `${saleCnt}( $${totalRevenue.toLocaleString()})`,
      commissions: commissions.map((commission) => ({
        ...commission,
        ID:
          commission.ID > 0
            ? convertNumToString({
                value: commission.ID,
                length: 7,
                prefix: 'C',
              })
            : '-',
        commission: commission.commission.toLocaleString(),
        paymentMethod: '-',
      })),
      top10Earners: top10Earners.map((miner) => ({
        ...miner,
        earning: miner.earning.toLocaleString(),
      })),
      top10Sponsors: top10Sponsors.map((miner) => ({
        ...miner,
        earning: miner.earning.toLocaleString(),
      })),
    };

    ejs.renderFile(
      path.join(__dirname, '../../views/report.ejs'),
      data,
      async (err, renderedHTML) => {
        if (err) {
          console.error(err);
          return;
        }

        const filePath = path.join(
          WEEKLY_REPORT_UPLOAD_DIR,
          `${iStartDate.format('YYYY-MM-DD')}`,
          'report.html'
        );
        // Save the rendered HTML to a file
        await fse.outputFile(filePath, renderedHTML, 'utf8');
        const stats = await fse.stat(filePath);

        await prisma.weeklyReport.upsert({
          where: {
            weekStartDate: iStartDate.toDate(),
          },
          create: {
            weekStartDate: iStartDate.toDate(),
            file: {
              create: {
                url: `${process.env.PUBLIC_DOMAIN}/public/weeklyreports/${iStartDate.format('YYYY-MM-DD')}/report.html`,
                originalName: 'report.html',
                mimeType: 'text/html',
                size: stats.size,
                localPath: filePath,
              },
            },
          },
          update: {},
        });
      }
    );
  }
};

const args: string[] = process.argv;
const all = args.findIndex((arg) => arg.toLowerCase() === '-all') !== -1;

generateWeeklyReport(all);
