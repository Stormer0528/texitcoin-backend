import { PrismaClient } from '@prisma/client';

import { payoutData } from './payout';
import { packageData } from './package';
import { adminData } from './admin';
import { paymentMethodData } from './paymentMethod';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  await prisma.admin.createMany({ data: adminData, skipDuplicates: true });
  await prisma.payout.createMany({ data: payoutData, skipDuplicates: true });
  await prisma.package.createMany({ data: packageData, skipDuplicates: true });
  await prisma.paymentMethod.createMany({ data: paymentMethodData, skipDuplicates: true });

  console.log('Finished seed');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
