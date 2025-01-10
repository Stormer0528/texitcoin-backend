import { Context } from '@/context';
import { NextFn, ResolverData } from 'type-graphql';

export function recipientAccess() {
  return async ({ context, args: { data } }: ResolverData<Context>, next: NextFn) => {
    if (context.isAdmin) {
      return next();
    }

    const email = await context.prisma.recipient.findUnique({
      where: {
        id: data.id,
      },
    });

    if (context.user.id === email.recipientId) {
      return next();
    }

    throw new Error('Unauthorized');
  };
}
