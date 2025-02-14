import { Request, Response, NextFunction } from 'express';

import Container from 'typedi';

import { PrismaService } from '@/service/prisma';

export const emailDraft = async (req: Request, res: Response, next: NextFunction) => {
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
    if (email.isDraft) {
      return next();
    } else {
      res.status(401).send('You can not upload the attachments to sent email');
    }
  }

  return res.status(401).send('You can not access the attachments');
};
