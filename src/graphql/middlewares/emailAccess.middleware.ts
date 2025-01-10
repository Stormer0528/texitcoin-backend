import { Context } from '@/context';
import { NextFn, ResolverData } from 'type-graphql';

export function emailAccess() {
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

    throw new Error('Unauthorized');
  };
}
