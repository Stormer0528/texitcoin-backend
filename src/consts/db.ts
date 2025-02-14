import { Prisma } from '@prisma/client';

export const PERCENT = 100;
export const TXC = 100000000;

export const COLUMNS: Record<string, Prisma.Sql> = {
  createdAt: Prisma.sql`"createdAt"`,
  username: Prisma.sql`"username"`,
  fullName: Prisma.sql`"fullName"`,
  mobile: Prisma.sql`"mobile"`,
  assetId: Prisma.sql`"assetId"`,
  totalIntroducers: Prisma.sql`"totalIntroducers"`,
};

export const ORDER: Record<'asc' | 'desc' | 'ASC' | 'DESC', Prisma.Sql> = {
  asc: Prisma.sql`ASC`,
  desc: Prisma.sql`DESC`,
  ASC: Prisma.sql`ASC`,
  DESC: Prisma.sql`DESC`,
};
