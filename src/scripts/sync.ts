import { Prisma, PrismaClient, Statistics } from '@prisma/client';
import Bluebird from 'bluebird';

import { PERCENT } from '@/consts/db';

const prisma = new PrismaClient();

const createStatisticsWallets = async (statistic: Statistics) => {
  const memberStatistics = await prisma.memberStatistics.findMany({
    where: {
      statisticsId: statistic.id,
    },
  });

  await Bluebird.map(
    memberStatistics,
    async (memberStatistic) => {
      const memberWallets = await prisma.memberWallet.findMany({
        where: {
          memberId: memberStatistic.memberId,
        },
      });

      const memberStatisticsWalletData: Prisma.MemberStatisticsWalletUncheckedCreateInput[] =
        memberWallets.map((wallet) => {
          return {
            memberStatisticId: memberStatistic.id,
            memberWalletId: wallet.id,
            txc: Math.floor((wallet.percent / PERCENT / 100) * Number(memberStatistic.txcShared)),
            issuedAt: memberStatistic.issuedAt,
          };
        });

      await prisma.memberStatisticsWallet.createMany({
        data: memberStatisticsWalletData,
      });
    },
    { concurrency: 10 }
  );
};

const createMemberStatisticsWallets = async () => {
  const statistics = await prisma.statistics.findMany({
    where: {
      status: true,
    },
  });
  await Bluebird.map(statistics, async (statistic) => {
    await createStatisticsWallets(statistic);
  });

  console.log('Finished memberStatisticswallets');
};

async function sync() {
  console.log('sync is started');
  await createMemberStatisticsWallets();

  console.log('Finished rewarding operation');
}

sync();
