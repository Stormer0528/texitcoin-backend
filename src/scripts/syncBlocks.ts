import { Block, PrismaClient } from '@prisma/client';
import Bluebird from 'bluebird';

import { GET_BLOCK_COUNT, GET_BLOCK_HASH, GET_BLOCK, GET_NETWORK_HASH_PS } from '../consts';
import { rpcCommand } from '../utils/rpcCommand';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

const getBlockCountFromDatabase = async () => {
  try {
    const block = await prisma.block.findFirst({ orderBy: { blockNo: 'desc' } });

    return block?.blockNo ?? 0;
  } catch (err) {
    console.log('error => ', err);
  }
};

const updateMonthlyWeeklyDailyBlocks = async (
  dailyblockdata: Block[],
  type: 'day' | 'week' | 'month'
) => {
  const hashRateMap: Record<string, number> = {};
  const difficultyMap: Record<string, number> = {};
  const countMap: Record<string, number> = {};
  dailyblockdata.forEach((blockdata) => {
    const startofType = dayjs(blockdata.issuedAt).startOf(type).format('YYYY-MM-DD');

    if (!hashRateMap[startofType]) hashRateMap[startofType] = 0;
    hashRateMap[startofType] += blockdata.hashRate;

    if (!difficultyMap[startofType]) difficultyMap[startofType] = 0;
    difficultyMap[startofType] += blockdata.difficulty;

    if (!countMap[startofType]) countMap[startofType] = 0;
    countMap[startofType]++;
  });

  await Bluebird.map(
    Object.keys(countMap),
    (date) => {
      return prisma.weeklyBlock.upsert({
        where: {
          issuedAt: date,
        },
        create: {
          hashRate: hashRateMap[date] / countMap[date],
          difficulty: difficultyMap[date] / countMap[date],
        },
        update: {
          hashRate: hashRateMap[date] / countMap[date],
          difficulty: difficultyMap[date] / countMap[date],
        },
      });
    },
    {
      concurrency: 10,
    }
  );
};

const createBlocks = async (data) => {
  try {
    const result = await prisma.block.createMany({ data });
    const blockdates = [...new Set<string>(data.map((dt) => dt.issuedAt))];
    const dailyblockdata = await prisma.block.findMany({
      where: {
        issuedAt: {
          in: blockdates,
        },
      },
    });

    await updateMonthlyWeeklyDailyBlocks(dailyblockdata, 'day');
    await updateMonthlyWeeklyDailyBlocks(dailyblockdata, 'week');
    await updateMonthlyWeeklyDailyBlocks(dailyblockdata, 'month');

    console.log('Synced blocks');

    return result;
  } catch (err) {
    console.log('error => ', err);
  }
};

async function syncBlocks() {
  try {
    console.log('Syncing block');
    console.log('Connecting to PostgreSQL database');

    const [block, count] = await Promise.all([
      getBlockCountFromDatabase(),
      rpcCommand({ method: GET_BLOCK_COUNT }),
    ]);

    console.log(`synced blocks: ${block}, total blocks: ${count}`);

    const arr = Array.from({ length: count - block }, (_, index) => block + index + 1);

    const blocks = await Bluebird.map(
      arr,
      async (item) => {
        console.log(`Syncing ${item}`);
        const hash = await rpcCommand({ method: GET_BLOCK_HASH, params: [item] });

        const { height, time, difficulty } = await rpcCommand({
          method: GET_BLOCK,
          params: [hash],
        });

        console.log('height => ', height);

        const hashRate = await rpcCommand({ method: GET_NETWORK_HASH_PS, params: [120, height] });

        const createdAt = new Date(time * 1000);

        return {
          blockNo: height,
          difficulty,
          hashRate,
          issuedAt: new Date(createdAt.toISOString().split('T')[0]),
          createdAt,
          updatedAt: createdAt,
        };
      },
      { concurrency: 10 }
    );

    await createBlocks(blocks);
  } catch (err) {
    console.log('error => ', err);
  }
}

syncBlocks();
