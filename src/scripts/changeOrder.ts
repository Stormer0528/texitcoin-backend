import { PrismaClient } from '@prisma/client';
import Bluebird from 'bluebird';

const prisma = new PrismaClient();

async function sync() {
  console.log('updating order is started');
  const sales = await prisma.sale.findMany({ select: { id: true, orderedAt: true } });
  await Bluebird.map(
    sales,
    async (sale) => {
      // if (sale.id === '319b0059-ed75-41b0-b340-99f4c86fa77c')
      // console.log(sale.id, sale.orderedAt, dayjs(sale.orderedAt));
      await prisma.sale.update({
        where: {
          id: sale.id,
        },
        data: {
          orderedAt: new Date(sale.orderedAt.toISOString().split('T')[0]),
        },
      });
    },
    { concurrency: 10 }
  );

  console.log('Finished updating order operation');
}

sync();
