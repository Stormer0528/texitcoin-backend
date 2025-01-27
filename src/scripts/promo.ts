import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndUpdatePromos() {
  console.log('Started promo operation');

  await prisma.promo.updateMany({
    where: {
      endDate: {
        lt: new Date(),
      },
    },
    data: {
      status: false,
    },
  });
  console.log('Finished promo operation');
}

checkAndUpdatePromos();
