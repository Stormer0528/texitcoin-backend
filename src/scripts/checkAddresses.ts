import { validateAddresses } from '@/utils/validateAddress';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sync() {
  console.log('validation is started');
  const walletsAddress = await prisma.memberWallet.findMany({
    where: {
      deletedAt: null,
    },
  });

  const [res, invalidAddresses] = validateAddresses(walletsAddress.map((wallet) => wallet.address));
  if (res) {
    console.log('All are valid');
  } else {
    console.log(
      await prisma.memberWallet.findMany({
        where: {
          address: {
            in: invalidAddresses,
          },
          percent: {
            gt: 0,
          },
        },
        include: {
          member: {
            select: {
              username: true,
            },
          },
        },
      })
    );
  }

  console.log('Finished validation');
}

sync();
