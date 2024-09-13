import { Prisma, PrismaClient, Statistics } from '@prisma/client';
import dayjs from 'dayjs';
import Bluebird from 'bluebird';

import { PERCENT, TXC } from '@/consts/db';
import { SaleSearchResult } from '@/type';

import { formatDate } from '@/utils/common';

const prisma = new PrismaClient();

const createStatistic = async (date: Date, sales: SaleSearchResult[]) => {
  const totalBlocks: number = await prisma.block.count({
    where: {
      issuedAt: {
        lte: date,
      },
    },
  });

  const {
    _min: { createdAt: from },
    _max: { createdAt: to },
    _count: newBlocks,
  } = await prisma.block.aggregate({
    _min: {
      createdAt: true,
    },
    _max: {
      createdAt: true,
    },
    _count: true,
    where: {
      issuedAt: date,
    },
  });
  const totalHashPower: number = sales.reduce((prev: number, sale: SaleSearchResult) => {
    return prev + sale.package.token;
  }, 0);
  const memberIds: string[] = [];
  const membersWithHashPower: Record<string, number> = {};
  sales.map((sale) => {
    if (!membersWithHashPower[sale.memberId]) {
      membersWithHashPower[sale.memberId] = 0;
      memberIds.push(sale.memberId);
    }
    membersWithHashPower[sale.memberId] = membersWithHashPower[sale.memberId] + sale.package.token;
  });
  const totalMembers: number = memberIds.length;
  const txcShared: number = newBlocks * 254 * TXC;
  const issuedAt: Date = date;
  const statistic: Statistics = await prisma.statistics.create({
    data: {
      newBlocks,
      totalBlocks,
      totalHashPower,
      totalMembers,
      status: false,
      txcShared,
      issuedAt,
      from: from || date,
      to: to || date,
    },
  });
  return {
    statistic,
    memberIds,
    membersWithHashPower,
  };
};

const createMemberStatisticsAndStatisticsWallets = async (
  statistic: Statistics,
  memberIds: string[],
  membersWithHashPower: Record<string, number>,
  issuedAt: Date
) => {
  const totalHashPower: number = statistic.totalHashPower;
  const totalTxcShared: number = Number(statistic.txcShared);

  await Bluebird.map(
    memberIds,
    async (memberId: string) => {
      const percent: number = Math.floor(
        (membersWithHashPower[memberId] / totalHashPower) * 100 * PERCENT
      );
      const txcShared: number = Math.floor((percent / 100 / PERCENT) * totalTxcShared);
      const hashPower: number = membersWithHashPower[memberId];
      const statisticsId: string = statistic.id;
      const memberStatistic = await prisma.memberStatistics.create({
        data: {
          txcShared,
          hashPower,
          percent,
          statisticsId,
          issuedAt,
          memberId,
        },
      });

      const memberWallets = await prisma.memberWallet.findMany({
        where: {
          memberId: memberId,
          deletedAt: null,
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
const createStatisticSales = async (
  statistic: Statistics,
  sales: SaleSearchResult[],
  issuedAt: Date
) => {
  await prisma.statisticsSale.createMany({
    data: sales.map((sale: SaleSearchResult) => {
      return {
        saleId: sale.id,
        statisticsId: statistic.id,
        issuedAt,
      };
    }),
  });
};

const isBefore = (date1: Date, date2: Date) => {
  const strDate1 = date1.toISOString().split('T')[0].split('-');
  const strDate2 = date2.toISOString().split('T')[0].split('-');
  return (
    +strDate1[0] < +strDate2[0] ||
    (+strDate1[0] === +strDate2[0] && +strDate1[1] < +strDate2[1]) ||
    (+strDate1[0] === +strDate2[0] && +strDate1[1] === +strDate2[1] && +strDate1[2] < +strDate2[2])
  );
};

const createStatisticsAndMemberStatistics = async () => {
  console.log('Creating statistics & memberStatistics...');

  const lastReward = await prisma.statistics.findFirst({
    orderBy: {
      issuedAt: 'desc',
    },
  });

  const now = dayjs();
  for (
    let iDate = dayjs(lastReward.issuedAt).add(1, 'day');
    isBefore(iDate.toDate(), now.toDate());
    iDate = iDate.add(1, 'day')
  ) {
    const date = new Date(formatDate(iDate.toDate()));
    console.log(`Creating ${formatDate(date)}...`);
    const sales: SaleSearchResult[] = await prisma.sale.findMany({
      where: {
        orderedAt: {
          lt: iDate.add(1, 'day').toDate(),
        },
      },
      select: {
        id: true,
        memberId: true,
        package: true,
      },
    });
    const { statistic, memberIds, membersWithHashPower } = await createStatistic(date, sales);
    await createMemberStatisticsAndStatisticsWallets(
      statistic,
      memberIds,
      membersWithHashPower,
      date
    );
    await createStatisticSales(statistic, sales, date);
    console.log(`Finished ${formatDate(iDate.toDate())}`);
  }
  console.log('Finished creating statistics & memberStatistics');
};

async function rewardTXC() {
  console.log('Started rewarding operation');

  await createStatisticsAndMemberStatistics();

  console.log('Finished rewarding operation');
}

rewardTXC();
