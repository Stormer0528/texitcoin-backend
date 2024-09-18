import { Context } from '@/context';
import { ELASTIC_LOG_TYPE, ElasticSearchService } from '@/service/elasticsearch';
import { NextFn, ResolverData } from 'type-graphql';
import Container from 'typedi';

export function minerLog(action: ELASTIC_LOG_TYPE) {
  const elasticsearch = Container.get(ElasticSearchService);

  return async ({ context, args: { data } }: ResolverData<Context>, next: NextFn) => {
    try {
      const res = await next();

      (async () => {
        let before: any = {};
        let after: any = {};
        if (action === 'create' || action === 'update') {
          after = await context.prisma.member.findUnique({
            where: {
              id: res.id,
            },
          });
        }
        if (action === 'remove' || action === 'update') {
          before = await context.prisma.member.findUnique({
            where: {
              id: data.id,
            },
          });
        }
        elasticsearch.addLog(
          context.user.username,
          context.isAdmin ? 'admin' : 'miner',
          'member',
          action,
          'success',
          after,
          before
        );
      })();

      return res;
    } catch (err) {
      (async () => {
        let before = {};

        if (action === 'remove' || action === 'update') {
          before = await context.prisma.member.findUnique({
            where: {
              id: data.id,
            },
          });
        }

        elasticsearch.addLog(
          context.user.username,
          context.isAdmin ? 'admin' : 'miner',
          'member',
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
