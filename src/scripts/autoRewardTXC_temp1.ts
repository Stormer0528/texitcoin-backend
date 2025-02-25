import { Prisma, PrismaClient, Statistics } from '@prisma/client';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import Bluebird from 'bluebird';
import * as shelljs from 'shelljs';
import { Client as ElasticClient } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import * as _ from 'lodash';

import { PERCENT, TXC } from '@/consts/db';
import { SaleSearchResult } from '@/type';

import { formatDate } from '@/utils/common';
import { PAYOUTS } from '@/consts';

dotenv.config();
dayjs.extend(utcPlugin);

const ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL ?? 'http://127.0.0.1:9200';
const ELASTIC_LOG_INDEX = process.env.ELASTIC_SHELL_LOG ?? 'shelllogtest';
const TRANSACTION_ADDRESS_LIMIT = 150;

const prisma = new PrismaClient({
  transactionOptions: {
    timeout: 20000,
  },
});
const elastic = new ElasticClient({
  node: ELASTIC_SEARCH_URL,
});

const createStatistic = async (tranPrisma: PrismaClient, date: Date, sales: SaleSearchResult[]) => {
  const totalBlocks: number = await tranPrisma.block.count({
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
  } = await tranPrisma.block.aggregate({
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
    if (!(sale.memberId in membersWithHashPower)) {
      membersWithHashPower[sale.memberId] = 0;
      memberIds.push(sale.memberId);
    }
    membersWithHashPower[sale.memberId] = membersWithHashPower[sale.memberId] + sale.package.token;
  });
  const totalMembers: number = memberIds.length;
  const txcShared: number = newBlocks * 254 * TXC;
  const issuedAt: Date = date;
  const statistic: Statistics = await tranPrisma.statistics.create({
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

const createMemberStatistics = async (
  tranPrisma: PrismaClient,
  statistic: Statistics,
  memberIds: string[],
  membersWithHashPower: Record<string, number>,
  issuedAt: Date
) => {
  const totalHashPower: number = statistic.totalHashPower;
  const totalTxcShared: number = Number(statistic.txcShared);

  const members = await tranPrisma.member.findMany({
    where: {
      id: {
        in: memberIds,
      },
      memberWallets: {
        none: {},
      },
    },
  });

  if (members.length) {
    throw new Error(
      `There are members with no wallets - ${members.map((mb) => mb.username).join(',')}`
    );
  }

  return await Bluebird.map(
    memberIds,
    async (memberId: string) => {
      const percent: number = membersWithHashPower[memberId] / totalHashPower;
      const txcShared: number = Math.floor(percent * totalTxcShared);
      const hashPower: number = membersWithHashPower[memberId];
      const statisticsId: string = statistic.id;
      return await tranPrisma.memberStatistics.create({
        data: {
          txcShared,
          hashPower,
          percent: Math.floor(percent * 100 * PERCENT),
          statisticsId,
          issuedAt,
          memberId,
        },
        select: {
          id: true,
          memberId: true,
          txcShared: true,
        },
      });
    },
    { concurrency: 10 }
  );
};
const createStatisticSales = async (
  tranPrisma: PrismaClient,
  statistic: Statistics,
  sales: SaleSearchResult[],
  issuedAt: Date
) => {
  await tranPrisma.statisticsSale.createMany({
    data: sales.map((sale: SaleSearchResult) => {
      return {
        saleId: sale.id,
        statisticsId: statistic.id,
        issuedAt,
      };
    }),
  });
};

const createStatisticsAndMemberStatistics = async (tranPrisma: PrismaClient) => {
  console.log('Creating statistics & memberStatistics...');

  const lastReward = await tranPrisma.statistics.findFirst({
    orderBy: {
      issuedAt: 'desc',
    },
  });

  const now = dayjs().utc();
  for (
    let iDate = dayjs(lastReward.issuedAt).utc().add(1, 'day');
    iDate.isBefore(now, 'day');
    iDate = iDate.add(1, 'day')
  ) {
    const date = iDate.toDate();
    console.log(`Creating ${formatDate(date)}...`);
    const sales: SaleSearchResult[] = await tranPrisma.sale.findMany({
      where: {
        orderedAt: {
          lt: iDate.add(1, 'day').toDate(),
        },
        member: {
          status: true,
        },
        status: true,
      },
      select: {
        id: true,
        memberId: true,
        package: true,
      },
    });
    const { statistic, memberIds, membersWithHashPower } = await createStatistic(
      tranPrisma,
      date,
      sales
    );
    const statistics = await createMemberStatistics(
      tranPrisma,
      statistic,
      memberIds,
      membersWithHashPower,
      date
    );
    const txcShared = statistics.reduce((prev: bigint, cur) => prev + cur.txcShared, BigInt(0));
    const mapMemberStatistics = {};
    statistics.forEach(
      (st) =>
        (mapMemberStatistics[st.memberId] = {
          txc: Number(st.txcShared),
          id: st.id,
        })
    );

    await tranPrisma.statistics.update({
      where: {
        id: statistic.id,
      },
      data: {
        txcShared,
      },
    });

    await createStatisticSales(tranPrisma, statistic, sales, date);
    const wallets = await prisma.memberWallet.findMany({
      where: {
        memberId: {
          in: statistics.map((stt) => stt.memberId),
        },
        OR: [
          {
            payoutId: PAYOUTS[0],
          },
          {
            payoutId: PAYOUTS[1],
          },
        ],
        deletedAt: null,
      },
      select: {
        id: true,
        address: true,
        percent: true,
        memberId: true,
      },
    });

    const chunked = _.chunk(wallets, TRANSACTION_ADDRESS_LIMIT);
    const memberStatisticsWallet: Prisma.MemberStatisticsWalletUncheckedCreateInput[] = [];
    const transactionIDS = chunked
      .map((chunkWallets) => {
        const paramJSON = {};
        chunkWallets.forEach((wallet) => {
          const txc = Math.floor(
            (mapMemberStatistics[wallet.memberId].txc * wallet.percent) / (PERCENT * 100)
          );
          memberStatisticsWallet.push({
            memberStatisticId: mapMemberStatistics[wallet.memberId].id,
            memberWalletId: wallet.id,
            txc,
            issuedAt: statistic.issuedAt,
          });
          if (txc) {
            paramJSON[wallet.address] = (paramJSON[wallet.address] ?? 0) + txc / TXC;
          }
        });

        // const shellCommand = `texitcoin-cli sendmany "" "${JSON.stringify(paramJSON).replaceAll('"', '\\"')}"`;
        // const { stdout: transactionID, stderr: error } = shelljs.exec(shellCommand);
        // elastic.index({
        //   index: ELASTIC_LOG_INDEX,
        //   document: {
        //     when: new Date().toISOString(),
        //     command: 'texitcoin-cli',
        //     subcommand: 'sendmany',
        //     fullCommand: shellCommand,
        //     extra: {
        //       issuedAt: statistic.issuedAt,
        //       type: 'reward',
        //     },
        //     result: transactionID.trim(),
        //     error,
        //     status: error ? 'failed' : 'success',
        //   },
        // });
        return '';
      })
      .filter(Boolean);

    if (transactionIDS.length) {
      await tranPrisma.statistics.update({
        where: {
          id: statistic.id,
        },
        data: {
          transactionId: transactionIDS.join(','),
          status: transactionIDS.length === chunked.length,
        },
      });
      await tranPrisma.memberStatisticsWallet.createMany({
        data: memberStatisticsWallet,
      });
    }

    console.log(`Finished ${formatDate(iDate.toDate())}`);
  }
  console.log('Finished creating statistics & memberStatistics');
};

async function rewardTXC(tranPrisma: PrismaClient) {
  console.log('Started rewarding operation');

  await createStatisticsAndMemberStatistics(tranPrisma);

  console.log('Finished rewarding operation');
}

prisma.$transaction(async (tranPrisma: PrismaClient) => {
  await rewardTXC(tranPrisma);
});
