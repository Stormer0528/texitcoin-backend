import { COLUMNS, ORDER } from '@/consts/db';
import { OrderBy } from '@/graphql/queryArgs';
import { Prisma } from '@prisma/client';

export const getDynamicOrderBy = (order: OrderBy | OrderBy[] | undefined) => {
  if (!order) return Prisma.sql`${COLUMNS.createdAt} ${ORDER.asc}`;
  const arrayOrder = Array.isArray(order) ? order : [order];
  return Prisma.join(
    arrayOrder.flatMap((ord) => {
      const entries = Object.entries(ord);
      return entries.map(
        ([column, sortOrder]) => Prisma.sql`${COLUMNS[column]} ${ORDER[sortOrder]}`
      );
    })
  );
};
