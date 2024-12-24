import { PrismaClient, WeeklyCommission, Proof } from '@prisma/client';
import ejs from 'ejs';
import fse from 'fs-extra';
import path from 'path';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import { WEEK_START, WEEKLY_REPORT_UPLOAD_DIR } from '@/consts';
import { convertNumToString } from '@/utils/convertNumToString';
import { formatName } from '@/utils/formatName';
import { isURL } from 'class-validator';

dayjs.extend(utcPlugin);

const prisma = new PrismaClient();
type CommissionType = WeeklyCommission & {
  fullName: string;
  assetId: string;
  note?: string;
  proofId?: string;
};

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
        status: true,
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

    const commissions: CommissionType[] = await prisma.$queryRaw<CommissionType[]>`
      SELECT weeklycommissions.*, members."fullName", members."assetId", proofs.note, proofs.id as "proofId"
      FROM weeklycommissions
        LEFT JOIN members ON weeklycommissions."memberId" = members.id
        LEFT JOIN proofs ON CONCAT('C-', LPAD(weeklycommissions."ID"::TEXT, 7, '0')) = proofs."refId" AND proofs.type::Text = 'COMMISSION'
      WHERE "weekStartDate" = ${iStartDate.format('YYYY-MM-DD')}::Date
          AND "commission" > 0
    `;
    const referencelinks = await prisma.referenceLink.findMany({
      where: {
        proofId: {
          in: commissions
            .filter((commission) => commission.proofId)
            .map((commission) => commission.proofId),
        },
        linkType: 'BOGO',
      },
    });
    const referenceMap: Record<string, string[]> = {};
    referencelinks.forEach((reflink) => {
      if (!referenceMap[reflink.proofId]) {
        referenceMap[reflink.proofId] = [];
      }
      if (isURL(reflink.link)) {
        referenceMap[reflink.proofId].push(reflink.link);
      } else {
        referenceMap[reflink.proofId].push(`${process.env.ADMIN_URL}/${reflink.link}`);
      }
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

    const { hashPower: totalHash, revenue: totalRevenue } = await prisma.$queryRaw<
      { hashPower: number; revenue: number; saleCnt: number }[]
    >`
      SELECT SUM(packages.token)::Int as "hashPower", SUM(packages.amount)::Int as "revenue", COUNT(*)::Int as "saleCnt"
      FROM sales
      LEFT JOIN packages ON sales."packageId" = packages.id
      WHERE sales."orderedAt" < ${iStartDate.add(1, 'week').format('YYYY-MM-DD')}::Date
    `.then((res) => res[0]);

    const totalCommission = await prisma.$queryRaw<{ commission: number }[]>`
      SELECT SUM(weeklycommissions.commission)::Int as commission
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

    const date = `Week #${Math.ceil(iStartDate.diff(dayjs(WEEK_START, { utc: true }), 'day') / 7) + 1}, ${iStartDate.format('MM/DD')}-${iStartDate.add(1, 'week').subtract(1, 'day').format('MM/DD')}`;
    const top10Earners = await prisma.$queryRaw<{ fullName: string; earning: number }[]>`
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
      SELECT "fullName", COALESCE("earning", 0) AS "earning"
      FROM members
      LEFT JOIN earnings ON members.id = earnings."memberId"
      LEFT JOIN sponsors ON members.id = sponsors."sponsorId"
      WHERE "members"."createdAt" < ${iStartDate.add(1, 'week').format('YYYY-MM-DD')}::Date
      ORDER BY earning DESC NULLS LAST
	    LIMIT 10
    `;

    const top10Sponsors = await prisma.$queryRaw<{ fullName: string; sponsor: number }[]>`
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
      SELECT "fullName", COALESCE("sponsor", 0) AS "sponsor"
      FROM members
      LEFT JOIN earnings ON members.id = earnings."memberId"
      LEFT JOIN sponsors ON members.id = sponsors."sponsorId"
      WHERE "members"."createdAt" < ${iStartDate.add(1, 'week').format('YYYY-MM-DD')}::Date
      ORDER BY sponsor DESC NULLS LAST
      LIMIT 10
    `;

    const data = {
      year: iStartDate.format('YYYY'),
      date,
      newExpenses,
      newRevenue: newRevenue.toLocaleString(),
      totalRevenue: totalRevenue.toLocaleString(),
      revenueGrowth: ((newRevenue / (totalRevenue - newRevenue)) * 100).toFixed(2),
      newHash,
      totalHash,
      hashGrowth: ((newHash / (totalHash - newHash)) * 100).toFixed(2),
      newCommission: newCommission.toLocaleString(),
      totalCommission: totalCommission.toLocaleString(),
      commissionGrowth: ((newCommission / (totalCommission - newCommission)) * 100).toFixed(2),
      sales: sales
        .filter((sale) => sale.package.amount > 0)
        .map((sale) => ({
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
          member: {
            ...sale.member,
            fullName: formatName(sale.member.fullName),
          },
        })),
      freeSales: sales
        .filter((sale) => sale.package.amount === 0)
        .map((sale) => ({
          ...sale,
          ID: convertNumToString({
            value: sale.ID,
            length: 7,
            prefix: 'S',
          }),
          orderedAt: dayjs(sale.orderedAt, { utc: true }).format('MM/DD/YYYY'),
          member: {
            ...sale.member,
            fullName: formatName(sale.member.fullName),
          },
        })),
      freeTotalHash: sales
        .filter((sale) => sale.package.amount === 0)
        .reduce((prev, sale) => prev + sale.package.token, 0),
      commissions: commissions.map((commission) => ({
        ...commission,
        date: dayjs(commission.createdAt, { utc: true }).format('YYYY/MM/DD'),
        ID:
          commission.ID > 0
            ? convertNumToString({
                value: commission.ID,
                length: 7,
                prefix: 'C',
              })
            : '-',
        commission: commission.commission.toLocaleString(),
        links:
          commission.proofId && referenceMap[commission.proofId]
            ? referenceMap[commission.proofId]
            : [],
        fullName: formatName(commission.fullName),
      })),
      top10Earners: top10Earners.map((miner) => ({
        fullName: formatName(miner.fullName),
        earning: miner.earning.toLocaleString(),
      })),
      top10Sponsors: top10Sponsors.map((miner) => ({
        fullName: formatName(miner.fullName),
        sponsor: miner.sponsor,
      })),
    };

    const cloneDate = iStartDate;
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
          `${cloneDate.format('YYYY-MM-DD')}`,
          'report.html'
        );
        // Save the rendered HTML to a file
        await fse.outputFile(filePath, renderedHTML, 'utf8');
        const stats = await fse.stat(filePath);

        await prisma.weeklyReport.upsert({
          where: {
            weekStartDate: cloneDate.toDate(),
          },
          create: {
            weekStartDate: cloneDate.toDate(),
            file: {
              create: {
                url: `${process.env.PUBLIC_DOMAIN}/public/weeklyreports/${cloneDate.format('YYYY-MM-DD')}/report.html`,
                originalName: 'report.html',
                mimeType: 'text/html',
                size: stats.size,
                localPath: filePath,
              },
            },
          },
          update: {
            weekStartDate: cloneDate.toDate(),
            file: {
              update: {
                url: `${process.env.PUBLIC_DOMAIN}/public/weeklyreports/${cloneDate.format('YYYY-MM-DD')}/report.html`,
                originalName: 'report.html',
                mimeType: 'text/html',
                size: stats.size,
                localPath: filePath,
              },
            },
          },
        });
      }
    );
  }
};

const args: string[] = process.argv;
const all = args.findIndex((arg) => arg.toLowerCase() === '-all') !== -1;

generateWeeklyReport(all);
