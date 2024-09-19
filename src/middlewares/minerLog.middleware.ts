import { Context } from '@/context';
import { ELASTIC_LOG_TYPE, ElasticSearchService } from '@/service/elasticsearch';
import { NextFn, ResolverData } from 'type-graphql';
import Container from 'typedi';
import _ from 'lodash';

export function minerLog(action: ELASTIC_LOG_TYPE) {
  const elasticsearch = Container.get(ElasticSearchService);

  return async ({ context, args: { data } }: ResolverData<Context>, next: NextFn) => {
    let before: any = {};
    let target: string = '';

    try {
      if (action === 'remove' || action === 'update') {
        const { id, password, token, createdAt, updatedAt, deletedAt, ...rest } =
          await context.prisma.member.findUnique({
            where: {
              id: data.id,
            },
            include: {
              memberWallets: {
                select: {
                  payout: {
                    select: {
                      method: true,
                      status: true,
                      name: true,
                      display: true,
                    },
                  },
                  address: true,
                  percent: true,
                },
                where: {
                  deletedAt: null,
                },
              },
            },
          });

        before = rest;
        target = before.username;
      }

      const res = await next();

      (async () => {
        let after: any = {};

        if (action === 'create' || action === 'update') {
          const { id, password, token, createdAt, updatedAt, deletedAt, ...rest } =
            await context.prisma.member.findUnique({
              where: {
                id: res.id,
              },
              include: {
                memberWallets: {
                  select: {
                    payout: {
                      select: {
                        method: true,
                        status: true,
                        name: true,
                        display: true,
                      },
                    },
                    address: true,
                    percent: true,
                  },
                  where: {
                    deletedAt: null,
                  },
                },
              },
            });

          after = rest;
          target = after.username;
        }
        elasticsearch.addLog(
          context.user.username,
          context.isAdmin ? 'admin' : 'miner',
          'member',
          target,
          action,
          'success',
          after,
          before
        );
      })();

      return res;
    } catch (err) {
      (async () => {
        elasticsearch.addLog(
          context.user.username,
          context.isAdmin ? 'admin' : 'miner',
          'member',
          target,
          action,
          'failed',
          {},
          before
        );
      })();

      throw err;
    }
  };
}
