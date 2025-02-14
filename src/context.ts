import type { IncomingMessage } from 'http';
import { StandaloneServerContextFunctionArgument } from '@apollo/server/dist/esm/standalone';
import { ContextFunction } from '@apollo/server';
import { Admin, Member, PrismaClient } from '@prisma/client';
import Container from 'typedi';

import { verifyToken } from '@/utils/auth';
import RootDataLoader from './graphql/loader';
import { PrismaService } from './service/prisma';

const prisma = Container.get(PrismaService);

export interface Context {
  user?: Member | Admin;
  isAdmin?: boolean;
  prisma: PrismaClient;
  req: IncomingMessage;
  dataLoader: RootDataLoader;
}

export const context: ContextFunction<[StandaloneServerContextFunctionArgument], Context> = async ({
  req,
}): Promise<Context> => {
  const token = req.headers.authorization?.split(' ')[1];
  let user: Member | Admin = null;
  let isAdmin: boolean = false;
  if (token) {
    const { id, isAdmin: admin } = verifyToken(token) as any;
    isAdmin = admin;

    if (admin) {
      user = await prisma.admin.findUnique({ where: { id } });
    } else {
      user = await prisma.member.findUnique({ where: { id } });
    }
  }

  return {
    user,
    isAdmin,
    req,
    prisma,
    dataLoader: new RootDataLoader(prisma, {}, user, isAdmin),
  };
};
