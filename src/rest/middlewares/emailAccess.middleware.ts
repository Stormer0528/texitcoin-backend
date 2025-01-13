import { Request, Response, NextFunction } from 'express';

import Container from 'typedi';

import { PrismaService } from '@/service/prisma';

export const emailAccess =
  (recipient: boolean = false) =>
  async (req: Request, res: Response, next: NextFunction) => {
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

    if (recipient) {
      const recp = await prisma.recipient.findUnique({
        where: {
          emailId_recipientId: {
            emailId,
            recipientId: userId,
          },
        },
      });

      if (recp) {
        return next();
      }
    }

    return res.status(401).send('You can not access the attachments');
  };
