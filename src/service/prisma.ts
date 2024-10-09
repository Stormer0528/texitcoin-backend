import { Service } from 'typedi';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { AsyncLocalStorage } from 'node:async_hooks';

@Service()
export class PrismaService extends PrismaClient<
  {
    log: {
      emit: 'event';
      level: 'query';
    }[];
  },
  'query',
  DefaultArgs
> {
  constructor() {
    super({ log: [{ emit: 'event', level: 'query' }] });

    const prisma = this;

    prisma.$on('query', (e) => {
      console.log(e);
    });

    const asyncLocalStorage = new AsyncLocalStorage<Prisma.TransactionClient>();

    const prisma$transaction = prisma.$transaction;
    prisma.$transaction = (...args: any[]) => {
      if (typeof args[0] === 'function') {
        const fn = args[0];
        args[0] = (txClient: Prisma.TransactionClient) => {
          return asyncLocalStorage.run(txClient, () => fn(txClient));
        };
      }

      return prisma$transaction.apply(prisma, args);
    };

    return new Proxy(prisma, {
      get(_, p, receiver) {
        const client = asyncLocalStorage.getStore() || prisma;

        // const transaction = asyncLocalStorage.getStore();
        // console.log('transaction', transaction);
        // if (transaction && p === '$transaction') {
        //   console.log('$$$');
        //   return async (func: any) => func(transaction);
        // }

        // In case you do want to access the root PrismaClient inside of
        // a transaction, it's easy enough:
        if (p === '$root') {
          return prisma;
        }

        return Reflect.get(client, p, receiver);
      },

      // If you mock database calls in tests via `jest.spyOn()` or the like, you
      // will need to implement `set` and `defineProperty` traps as well.
    });
  }
}
