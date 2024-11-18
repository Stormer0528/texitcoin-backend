import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import utcPlugin from 'dayjs/plugin/utc';

import { formatDate } from '@/utils/common';
import Bluebird from 'bluebird';
import { calculatePoint } from '@/utils/calculatePoint';
import { addPoint } from '@/utils/addPoint';

dayjs.extend(weekOfYear);
dayjs.extend(utcPlugin);

const prisma = new PrismaClient({
  transactionOptions: {
    timeout: 20000,
  },
});

async function getSalesByWeekStart(tranPrisma: PrismaClient, startDate: Date) {
  return await tranPrisma.sale.findMany({
    where: {
      orderedAt: {
        gte: startDate,
        lt: dayjs(startDate).add(1, 'week').toDate(),
      },
    },
    include: {
      member: true,
      package: {
        select: {
          point: true,
        },
      },
    },
  });
}

async function weeklyCommission(tranPrisma: PrismaClient, preview: boolean = false) {
  console.log('Started weekly commission operation');

  const lastWeeklyCommission = await tranPrisma.weeklyCommission.findFirst({
    orderBy: {
      weekStartDate: 'desc',
    },
  });

  const allMembers = await tranPrisma.member.findMany({});
  const mapMembers = {};
  allMembers.forEach((mb) => {
    mapMembers[mb.id] = {
      ...mb,
    };
  });

  let iStartDate = dayjs('2024-04-06').utc().startOf('week');

  const nowStartDate = dayjs().utc().startOf('week');
  if (lastWeeklyCommission) {
    iStartDate = dayjs(lastWeeklyCommission.weekStartDate).utc().add(1, 'week');
  }
  for (
    ;
    iStartDate.isBefore(nowStartDate.toDate(), 'day') ||
    (preview && iStartDate.isSame(nowStartDate.toDate(), 'day'));
    iStartDate = iStartDate.add(1, 'week')
  ) {
    console.log(`${formatDate(iStartDate.toDate())}, ${iStartDate.week()} started`);

    const weekSales = await getSalesByWeekStart(tranPrisma, iStartDate.toDate());
    const addedLeftPoint: Record<string, number> = {};
    const addedRightPoint: Record<string, number> = {};
    weekSales.forEach((sale) => {
      addPoint(
        mapMembers,
        {
          id: sale.memberId,
          point: sale.package.point,
        },
        addedLeftPoint,
        addedRightPoint,
        iStartDate.toDate()
      );
    });

    const prevWeekStartDate = new Date(formatDate(iStartDate.subtract(1, 'week').toDate()));
    const lastWeeklyCommissions = await tranPrisma.weeklyCommission.findMany({
      where: {
        weekStartDate: prevWeekStartDate,
      },
    });
    const resultMap: Record<string, { left: number; right: number }> = {}; //initial with previous status

    const members = await tranPrisma.member.findMany({
      where: {
        createdAt: {
          lt: new Date(formatDate(iStartDate.add(1, 'week').toDate())),
        },
      },
    });
    members.forEach((member) => (resultMap[member.id] = { left: 0, right: 0 }));

    if (lastWeeklyCommissions.length > 0) {
      lastWeeklyCommissions.forEach((commissionstatus) => {
        resultMap[commissionstatus.memberId] = {
          left: commissionstatus.endL,
          right: commissionstatus.endR,
        };
      });
    }

    const combinedMap: Record<string, { left: number; right: number }> = {};

    Object.keys(addedLeftPoint).forEach((id) => {
      combinedMap[id] = {
        left: (combinedMap[id]?.left ?? 0) + addedLeftPoint[id],
        right: combinedMap[id]?.right ?? 0,
      };
    });

    Object.keys(addedRightPoint).forEach((id) => {
      combinedMap[id] = {
        left: combinedMap[id]?.left ?? 0,
        right: (combinedMap[id]?.right ?? 0) + addedRightPoint[id],
      };
    });

    Object.keys(combinedMap).forEach((id) => {
      resultMap[id] = {
        left: (resultMap[id]?.left ?? 0) + combinedMap[id].left,
        right: (resultMap[id]?.right ?? 0) + combinedMap[id].right,
      };
    });

    await Bluebird.map(
      Object.entries(resultMap),
      async ([id, points]) => {
        const [finalLeft, finalRight, left, right, commission] = calculatePoint(points);

        await tranPrisma.member.update({
          where: {
            id,
          },
          data: {
            begL: finalLeft - left,
            begR: finalRight - right,
            newL: 0,
            newR: 0,
          },
        });

        await tranPrisma.member.update({
          where: {
            id,
          },
          data: {
            begL: finalLeft - left,
            begR: finalRight - right,
            newL: 0,
            newR: 0,
          },
        });

        return tranPrisma.weeklyCommission.create({
          data: {
            memberId: id,
            begL: points.left - (combinedMap[id]?.left ?? 0),
            begR: points.right - (combinedMap[id]?.right ?? 0),
            newL: combinedMap[id]?.left ?? 0,
            newR: combinedMap[id]?.right ?? 0,
            maxL: finalLeft,
            maxR: finalRight,
            endL: finalLeft - left,
            endR: finalRight - right,
            pkgL: left,
            pkgR: right,
            commission,
            status: commission > 0 ? 'PENDING' : 'NONE',
            weekStartDate: iStartDate.toDate(),
          },
        });
      },
      { concurrency: 10 }
    );
  }

  console.log('Finished weekly commission operation');
}

prisma.$transaction(async (tranPrisma: PrismaClient) => {
  const args: string[] = process.argv;
  const preview = args.findIndex((arg) => arg.toLowerCase() === '-preview') !== -1;
  await weeklyCommission(tranPrisma, preview);
});
