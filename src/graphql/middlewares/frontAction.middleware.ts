import { Context } from '@/context';
import { FrontActionService } from '@/service/frontaction';
import graphqlFields from 'graphql-fields';
import { MiddlewareFn, NextFn, ResolverData } from 'type-graphql';
import Container from 'typedi';

export const frontActionMiddleware: MiddlewareFn<any> = async (
  { context, args, info }: ResolverData<Context>,
  next: NextFn
) => {
  if (info.parentType.name === 'Mutation') {
    const asyncLocalStorage = Container.get(FrontActionService).asyncLocalStorage;
    return asyncLocalStorage.run({}, async () => {
      const res = await next();
      const store = asyncLocalStorage.getStore();
      const fields = graphqlFields(info);

      if (store?.action && 'frontAction' in fields) {
        res.frontAction = store;
      }

      return res;
    });
  }

  return next();
};

export default frontActionMiddleware;
