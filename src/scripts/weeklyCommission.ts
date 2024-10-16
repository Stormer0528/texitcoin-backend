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
  mapMembers: Record<string, any>,
  sale: { id: string; point: number },
  addedLeftPoint: Record<string, number>,
  addedRightPoint: Record<string, number>,
  weekStartDate: Date
) {
  if (!sale.point) return;
  let iID = sale.id;
  const ids: { id: string; position: string }[] = [];
  while (iID !== PLACEMENT_ROOT && iID) {
    if (!mapMembers[iID]) break;

    if (mapMembers[iID].placementParentId && mapMembers[mapMembers[iID].placementParentId]) {
      ids.push({
        id: mapMembers[iID].placementParentId,
        position: mapMembers[iID].placementPosition,
      });
    }
    iID = mapMembers[iID].placementParentId;
  }

  ids.forEach((id) => {
    if (id.position === 'LEFT') {
      addedLeftPoint[id.id] = (addedLeftPoint[id.id] ?? 0) + sale.point;
    } else if (id.position === 'RIGHT') {
      addedRightPoint[id.id] = (addedRightPoint[id.id] ?? 0) + sale.point;
    }
  });
}

function calculatePoint(points: { left: number; right: number }) {
  const orgLeft = Math.min(9, points.left);
  const orgRight = Math.min(9, points.right);
  if (orgLeft >= 9 && orgRight >= 9) {
    return [9, 9, 3000];
  } else if (orgLeft >= 6 && orgRight >= 6) {
    return [6, 6, 2000];
  } else if (orgLeft >= 3 && orgRight >= 3) {
    return [3, 3, 1000];
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

    const members = await tranPrisma.member.findMany({
      where: {
        createdAt: {
          lt: new Date(formatDate(iStartDate.add(1, 'week').toDate())),
        },
      },
    });

    const mapMembers = {};
    members.forEach((mb) => {
      mapMembers[mb.id] = {
        ...mb,
      };
    });

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

    members.forEach((member) => (resultMap[member.id] = { left: 0, right: 0 }));

    if (lastWeeklyCommissions.length > 0) {
      lastWeeklyCommissions.forEach((commissionstatus) => {
        resultMap[commissionstatus.memberId] = {
          left: commissionstatus.afterLeftPoint,
          right: commissionstatus.afterRightPoint,
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
        const [left, right, commission] = calculatePoint(points);
        let resLeft = points.left;
        let resRight = points.right;
        if (commission > 0) {
          resLeft = 0;
          resRight = 0;
        }
        return tranPrisma.weeklyCommission.create({
          data: {
            memberId: id,
            beforeLeftPoint: points.left,
            beforeRightPoint: points.right,
            afterLeftPoint: resLeft,
            afterRightPoint: resRight,
            calculatedLeftPoint: left,
            calculatedRightPoint: right,
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
  await weeklyCommission(tranPrisma);
});
