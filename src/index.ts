import 'reflect-metadata';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLScalarType } from 'graphql';
import { DateTimeResolver } from 'graphql-scalars';
import * as tq from 'type-graphql';
import { Container } from 'typedi';
import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';

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
import { AddressInfo } from 'net';

// import "./env";

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
  });
  await apolloServer.start();

  const mainServer = express();
  mainServer.use(
    '/graphql',
    express.json(),
    expressMiddleware(apolloServer, {
      context,
    })
  );

  const APP_HOST = process.env.APP_HOST ?? '0.0.0.0';
  const APP_PORT = +process.env.APP_PORT ?? 4000;
  mainServer.listen(APP_PORT, APP_HOST, () => {
    console.log(`🚀 Server ready at: ${APP_HOST}:${APP_PORT}`);
  });
};

app();
