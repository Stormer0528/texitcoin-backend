import { PrismaClient } from '@prisma/client';
import Bluebird from 'bluebird';

import { GET_BLOCK_COUNT, GET_BLOCK_HASH, GET_BLOCK, GET_NETWORK_HASH_PS } from '../consts';
import { rpcCommand } from '../utils/rpcCommand';

const prisma = new PrismaClient();

const getBlockCountFromDatabase = async () => {
  try {
    const block = await prisma.block.findFirst({ orderBy: { blockNo: 'desc' } });

    return block?.blockNo ?? 0;
  } catch (err) {
    console.log('error => ', err);
  }
};

const createBlocks = async (data) => {
  try {
    const result = await prisma.block.createMany({ data });

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
