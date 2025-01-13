import { Request, Response, NextFunction } from 'express';

import Container from 'typedi';

import { JWT_TOKENEXPIRED } from '@/consts/errors';
import { verifyToken } from '@/utils/auth';
import { PrismaService } from '@/service/prisma';

export const emailAccess = async (req: Request, res: Response, next: NextFunction) => {
  const { id: userId, isAdmin } = (req as any).user;
  if (isAdmin) {
    return next();
  }

  const emailId = req.params.id;
  const prisma = Container.get(PrismaService);
  const email = await prisma.email.findUnique({
    where: {
      id: emailId,
    },
  });

  if (email && email.senderId === userId) {
    return next();
  }

  const recipient = await prisma.recipient.findUnique({
    where: {
      emailId_recipientId: {
        emailId,
        recipientId: userId,
      },
    },
  });

  if (recipient) {
    return next();
  }

  return res.status(401).send('You can not access the attachments');
};
