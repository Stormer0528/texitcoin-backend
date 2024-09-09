import { Prisma, PrismaClient } from '@prisma/client';
import Bluebird from 'bluebird';

const prisma = new PrismaClient();

const removeRewardByDate = async (date: string) => {
  const result = await prisma.$transaction(async (prisma) => {
    const statistic = await prisma.statistics.findFirst({
      where: {
        issuedAt: date,
      },
    });
    if (!statistic) {
      console.log('No reward');
      return;
    }
    console.log('fetched reward');
    await prisma.statisticsSale.deleteMany({
      where: {
        statisticsId: statistic.id,
      },
    });
    console.log('removed reward sales');
    const memberstatistics = await prisma.memberStatistics.findMany({
      where: {
        statisticsId: statistic.id,
      },
    });
    console.log('fetched member statistics');
    await prisma.memberStatisticsWallet.deleteMany({
      where: {
        memberStatisticId: {
          in: memberstatistics.map((ms) => ms.id),
        },
      },
    });
    console.log('removed member statistics wallets');
    await prisma.memberStatistics.deleteMany({
      where: {
        statisticsId: statistic.id,
      },
    });
    console.log('removed member statistics');

    await prisma.statistics.delete({
      where: {
        id: statistic.id,
      },
    });
    console.log('removed reward');
  });
};

async function sync() {
  console.log('operation is started');
  await removeRewardByDate('2024-09-07T00:00:00.000Z');

  console.log('Finished operation');
}

sync();
