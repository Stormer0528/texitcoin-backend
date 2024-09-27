import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { formatDate } from '@/utils/common';
import { isBefore } from '@/utils/isBeforeDate';
import { PLACEMENT_ROOT } from '@/consts';
import Bluebird from 'bluebird';

dayjs.extend(weekOfYear);

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

async function addPoint(
  tranPrisma: PrismaClient,
  mapMembers,
  sale: { id: string; point: number },
  addedLeftPoint,
  addedRightPoint
) {
  if (!sale.point) return;
  let iID = sale.id;
  const ids: { id: string; position: string }[] = [];
  while (iID !== PLACEMENT_ROOT && iID) {
    ids.push({
      id: mapMembers[iID].placementParentId,
      position: mapMembers[iID].placementPosition,
    });
    iID = mapMembers[iID].placementParentId;
  }

  if (iID) {
    ids.forEach((id) => {
      if (id.position === 'LEFT') {
        addedLeftPoint[id.id] = (addedLeftPoint[id.id] ?? 0) + sale.point;
      } else if (id.position === 'RIGHT') {
        addedRightPoint[id.id] = (addedRightPoint[id.id] ?? 0) + sale.point;
      }
    });
  }
}

function calculatePoint(points: { left: number; right: number }) {
  const orgLeft = Math.min(9, points.left);
  const orgRight = Math.min(9, points.right);
  if (orgLeft === orgRight) {
    if (orgLeft === 3) {
      return [3, 3, 1000];
    } else if (orgLeft === 6) {
      return [6, 6, 2000];
    } else if (orgLeft === 9) {
      return [9, 9, 3000];
    }
  }
  return [0, 0, 0];
}

async function weeklyCommission(tranPrisma: PrismaClient) {
  console.log('Started weekly commission operation');

  const lastWeeklyCommission = await tranPrisma.weeklyCommission.findFirst({
    orderBy: {
      weekStartDate: 'desc',
    },
  });

  let iStartDate = dayjs(new Date(formatDate(dayjs('2024-04-06').startOf('week').toDate())));
  const members = await tranPrisma.member.findMany({});
  const mapMembers = {};
  members.forEach((mb) => {
    mapMembers[mb.id] = {
      ...mb,
    };
  });

  const nowStartDate = dayjs().startOf('week');
  if (lastWeeklyCommission) {
    iStartDate = dayjs(
      formatDate(dayjs(lastWeeklyCommission.weekStartDate).add(1, 'week').toDate())
    );
  }
  for (
    ;
    isBefore(iStartDate.toDate(), nowStartDate.toDate());
    iStartDate = iStartDate.add(1, 'week')
  ) {
    console.log(`${formatDate(iStartDate.toDate())}, ${iStartDate.week()} started`);
    const weekSales = await getSalesByWeekStart(tranPrisma, iStartDate.toDate());
    const addedLeftPoint: Record<string, number> = {};
    const addedRightPoint: Record<string, number> = {};
    weekSales.forEach((sale) => {
      addPoint(
        tranPrisma,
        mapMembers,
        {
          id: sale.memberId,
          point: sale.package.point,
        },
        addedLeftPoint,
        addedRightPoint
      );
    });

    const resultMap: Record<string, { left: number; right: number }> = {};

    await Bluebird.map(
      Object.keys(addedLeftPoint),
      async (id) => {
        const lastCommission = await tranPrisma.weeklyCommission.findFirst({
          where: {
            id,
          },
          orderBy: {
            weekStartDate: 'desc',
          },
        });
        if (lastCommission) {
          resultMap[id] = {
            left:
              (lastCommission.commission > 0 ? 0 : Math.min(9, lastCommission.leftPoint)) +
              addedLeftPoint[id],
            right: lastCommission.commission > 0 ? 0 : Math.min(9, lastCommission.rightPoint),
          };
        } else {
          resultMap[id] = {
            left: addedLeftPoint[id],
            right: 0,
          };
        }
      },
      { concurrency: 10 }
    );

    await Bluebird.map(
      Object.keys(addedRightPoint),
      async (id) => {
        const lastCommission = await tranPrisma.weeklyCommission.findFirst({
          where: {
            id,
          },
          orderBy: {
            weekStartDate: 'desc',
          },
        });

        if (lastCommission) {
          resultMap[id] = {
            left: resultMap[id]
              ? resultMap[id].left
              : lastCommission.commission > 0
                ? 0
                : Math.min(9, lastCommission.leftPoint),
            right:
              (lastCommission.commission > 0 ? 0 : Math.min(9, lastCommission.rightPoint)) +
              addedRightPoint[id],
          };
        } else {
          resultMap[id] = {
            left: resultMap[id] ? resultMap[id].left : 0,
            right: addedRightPoint[id],
          };
        }
      },
      { concurrency: 10 }
    );

    await tranPrisma.weeklyCommission.createMany({
      data: Object.entries(resultMap).map(([id, points]) => {
        const [left, right, commission] = calculatePoint(points);
        return {
          memberId: id,
          calculatedLeftPoint: left,
          calculatedRightPoint: right,
          commission,
          leftPoint: points.left,
          rightPoint: points.right,
          weekStartDate: iStartDate.toDate(),
        };
      }),
    });
  }

  console.log('Finished weekly commission operation');
}

prisma.$transaction(async (tranPrisma: PrismaClient) => {
  await weeklyCommission(tranPrisma);
});
