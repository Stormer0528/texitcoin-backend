import { MiddlewareFn } from 'type-graphql';

import { Context } from '@/context';

export const userPermission: MiddlewareFn<Context> = async (
  {
    args,
    context: {
      user: { id },
      isAdmin,
    },
  },
  next
) => {
  if (!isAdmin && args.data.id !== id) {
    throw new Error('Not allowed');
  }

  return next();
};
