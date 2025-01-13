import { Context } from '@/context';
import { NextFn, ResolverData } from 'type-graphql';

export function emailAccess(recipient: boolean = false) {
  return async ({ context, args: { data } }: ResolverData<Context>, next: NextFn) => {
    if (context.isAdmin) {
      return next();
    }

    const email = await context.prisma.email.findUnique({
      where: {
        id: data.id,
      },
    });

    if (context.user.id === email.senderId) {
      return next();
    }

    if (recipient) {
      const recp = await context.prisma.recipient.findUnique({
        where: {
          emailId_recipientId: {
            emailId: data.id,
            recipientId: context.user.id,
          },
        },
      });

      if (recp) {
        return next();
      }
    }

    throw new Error('Unauthorized');
  };
}
