import { Prisma, PrismaClient } from '@prisma/client';
import Bluebird from 'bluebird';

const prisma = new PrismaClient();

const syncVisibilities = async () => {
  console.log('sync package is started');
  const res =
    await prisma.$queryRaw`UPDATE packages SET "enrollVisibility"=true WHERE "point" > 0 AND "status" = true`;
  console.log('query result => ', res);
  console.log('sync package is finished');
};

async function sync() {
  console.log('sync is started');
  await syncVisibilities();

  console.log('Finished sync operation');
}

sync();
