import { Member, Prisma, PrismaClient, Statistics } from '@prisma/client';
import dayjs from 'dayjs';
import Bluebird from 'bluebird';

import { PERCENT, TXC } from '@/consts/db';
import { SaleSearchResult } from '@/type';
import { payoutData } from 'prisma/seed/payout';

import { getMembers, getSales } from '@/utils/connectMlm';
import { formatDate } from '@/utils/common';
import { generateRandomString, hashPassword } from '@/utils/auth';

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

const createStatisticsAndMemberStatistics = async () => {
  console.log('Creating statistics & memberStatistics...');

  const now = dayjs();
  for (let iDate = dayjs('2024-04-01'); iDate.isBefore(now); iDate = iDate.add(1, 'day')) {
    const date = new Date(formatDate(iDate.toDate()));
    console.log(`Creating ${formatDate(iDate.toDate())}...`);
    const sales: SaleSearchResult[] = await prisma.sale.findMany({
      where: {
        orderedAt: {
          lt: new Date(iDate.add(1, 'day').toDate()),
        },
        status: true,
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

const toMember = (
  complexMember: any,
  hashedPassword: string
): Prisma.MemberUncheckedCreateInput => {
  return {
    assetId: complexMember.assetId,
    email: complexMember.email,
    fullName: complexMember.fullName,
    mobile: complexMember.mobile,
    primaryAddress: complexMember.primaryAddress,
    secondaryAddress: complexMember.secondaryAddress,
    ID: complexMember.ID,
    username: complexMember.username,
    city: complexMember.city,
    password: hashedPassword,
    state: complexMember.state,
    zipCode: complexMember.zipCode,
  };
};

const syncMembers = async () => {
  try {
    console.log('Syncing members...');

    const mlmMembers = await getMembers();
    const hashedPassword = await hashPassword('123456789');
    const members = await Bluebird.map(
      mlmMembers,
      async (member) => {
        let assetId: string = member.assetId;
        while (mlmMembers.findIndex((mb) => mb.assetId === assetId && mb.ID !== member.ID) >= 0) {
          assetId = generateRandomString(6);
        }
        const result = await prisma.member.create({
          data: {
            ...toMember(member, hashedPassword),
            assetId,
          },
        });

        const wallets: Prisma.MemberWalletUncheckedCreateInput[] = [];
        for (const [column, value] of Object.entries(member)) {
          const payout = payoutData.find((pyData) => pyData.name === column);
          if (payout && value && value !== 'NA') {
            wallets.push({
              address: value as string,
              memberId: result.id,
              payoutId: payout.id,
            });
          }
        }

        await prisma.memberWallet.createMany({
          data: wallets.map((wallet, idx) => {
            const unit = Math.floor((100 / wallets.length) * PERCENT);
            return {
              ...wallet,
              percent:
                idx === wallets.length - 1 ? 100 * PERCENT - unit * (wallets.length - 1) : unit,
            };
          }),
        });

        return result;
      },
      { concurrency: 10 }
    );

    console.log(`Successfully synced ${members.length} members`);

    return members;
  } catch (err) {
    console.log('error => ', err);
  }
};

const syncSales = async (members: Member[]) => {
  try {
    console.log('Syncing sales...');

    const mlmSales = await getSales(members);

    const sales = await prisma.sale.createManyAndReturn({ data: mlmSales });

    console.log('Successfully created sales');

    return sales;
  } catch (err) {
    console.log('error => ', err);
  }
};

async function rewardTXC() {
  console.log('Started rewarding operation');

  console.log('Removing statisticsSale');
  await prisma.statisticsSale.deleteMany({});
  console.log('Removing sales');
  await prisma.sale.deleteMany();

  console.log('Removing memberStatisticsWallet');
  await prisma.memberStatisticsWallet.deleteMany({});
  console.log('Removing memberWallet');
  await prisma.memberWallet.deleteMany({});
  console.log('Removing memberStatistics');
  await prisma.memberStatistics.deleteMany({});
  console.log('Removing member');
  await prisma.member.deleteMany({});

  console.log('Removing statistics');
  await prisma.statistics.deleteMany({});
  console.log('Successfully deleted current database.');

  const members = await syncMembers();
  const _sales = await syncSales(members);

  await createStatisticsAndMemberStatistics();

  console.log('Finished rewarding operation');
}

rewardTXC();
