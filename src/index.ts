import 'reflect-metadata';

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { GraphQLScalarType } from 'graphql';
import { DateTimeResolver } from 'graphql-scalars';
import * as tq from 'type-graphql';
import { Container } from 'typedi';
import cors from 'cors';

import { PAYMENT_UPLOAD_DIR } from './consts';
import { authChecker } from './authChecker';
import { Context, context } from './context';
import { formatError } from './formatError';

import { MemberResolver } from './entity/member/member.resolver';
import { SaleResolver } from './entity/sale/sale.resolver';
import { BigIntScalar } from './graphql/scalar/bigInt';
import { StatisticsResolver } from './entity/statistics/statistics.resolver';
import { MemberStatisticsResolver } from './entity/memberStatistics/memberStatistics.resolver';
import { BlockResolver } from './entity/block/block.resolver';
import { GeneralResolver } from './entity/general/general.resolver';
import { PackageResolver } from './entity/package/package.resolver';
import { PayoutResolver } from './entity/payout/payout.resolver';
import { StatisticsSaleResolver } from './entity/statisticsSale/statisticsSale.resolver';
import { AdminResolver } from './entity/admin/admin.resolver';
import { MemberWalletResolver } from './entity/memberWallet/memberWallet.resolver';
import { MemberStatisticsWalletResolver } from './entity/memberStatisticsWallet/memberStatisticsWallet.resolver';
import router from './rest/routes';
import { adminAuthorized } from './rest/middlewares/adminAuthorized.middleware';
import { DailyBlockResolver } from './entity/dailyblock/dailyblock.resolver';
import { WeeklyBlockResolver } from './entity/weeklyblock/weeklyblock.resolver';
import { MonthlyBlockResolver } from './entity/monthlyblock/monthlyblock.resolver';
import { WeeklyCommissionResolver } from './entity/weeklycommission/weeklycommission.resolver';
import { AdminNotesResolver } from './entity/adminNotes/adminNotes.resolver';

const app = async () => {
  const schema = await tq.buildSchema({
    resolvers: [
      AdminResolver,
      MemberResolver,
      SaleResolver,
      StatisticsResolver,
      StatisticsSaleResolver,
      MemberStatisticsResolver,
      BlockResolver,
      GeneralResolver,
      PackageResolver,
      PayoutResolver,
      MemberWalletResolver,
      MemberStatisticsWalletResolver,
      DailyBlockResolver,
      WeeklyBlockResolver,
      MonthlyBlockResolver,
      WeeklyCommissionResolver,
      AdminNotesResolver,
    ],
    authChecker,
    scalarsMap: [
      { type: GraphQLScalarType, scalar: DateTimeResolver },
      { type: BigInt, scalar: BigIntScalar },
    ],
    validate: { forbidUnknownValues: false },
    // Registry 3rd party IOC container
    container: Container,
  });

  const apolloServer = new ApolloServer<Context>({
    schema,
    formatError,
    introspection: process.env.SERVER_TYPE !== 'production',
  });
  await apolloServer.start();

  const mainServer = express();
  mainServer.use(
    process.env.SERVER_TYPE === 'production'
      ? cors<cors.CorsRequest>({
          origin: [process.env.ADMIN_URL, process.env.MEMBER_URL],
        })
      : cors()
  );
  mainServer.use(
    '/graphql',
    express.json(),
    expressMiddleware(apolloServer, {
      context,
    })
  );
  mainServer.use('/api', adminAuthorized, router);
  mainServer.use('/public/payment', adminAuthorized, express.static(PAYMENT_UPLOAD_DIR));

  const APP_HOST = process.env.APP_HOST ?? '0.0.0.0';
  const APP_PORT = process.env.APP_PORT ?? 4000;
  mainServer.listen(+APP_PORT, APP_HOST, () => {
    console.log(`🚀 Server ready at: ${APP_HOST}:${APP_PORT}`);
  });
};

app();
