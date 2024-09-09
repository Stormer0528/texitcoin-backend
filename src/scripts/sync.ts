import { Prisma, PrismaClient } from '@prisma/client';
import Bluebird from 'bluebird';

const prisma = new PrismaClient();

const createPoint = async () => {
  console.log('updating point is started');
  await prisma.member.updateMany({
    data: {
      point: 0,
    },
  });
  console.log('reseting all member point finished');

  const sales = await prisma.sale.findMany({
    include: {
      package: true,
    },
  });
  const membersMap: Record<string, number> = {};
  sales.forEach((sale) => {
    if (!membersMap[sale.memberId]) membersMap[sale.memberId] = 0;
    membersMap[sale.memberId] += sale.package.point;
  });

  await Bluebird.map(
    Object.entries(membersMap),
    async (memberMap) => {
      await prisma.member.update({
        where: {
          id: memberMap[0],
        },
        data: {
          point: memberMap[1],
        },
      });
    },
    {
      concurrency: 10,
    }
  );

  console.log('updating point is finished');
};

async function sync() {
  console.log('sync is started');
  await createPoint();

  console.log('Finished sync operation');
}

sync();
