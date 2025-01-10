import { Context } from '@/context';
import { NextFn, ResolverData } from 'type-graphql';

export function canAccess() {
  return async ({ context, args: { data }, info, root }: ResolverData<Context>, next: NextFn) => {
    if (context.isAdmin) {
      return next();
    }

    if (info.operation.name.value === 'fetchMe') {
      return next();
    }

    throw new Error('Not allowed');
  };
}
