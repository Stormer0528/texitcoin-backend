import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndUpdatePromos() {
  console.log('Started promo operation');

  await prisma.$queryRaw`UPDATE "promos" SET status = false WHERE "endDate" < CURRENT_DATE`;

  console.log('Finished promo operation');
}

checkAndUpdatePromos();
