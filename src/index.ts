import 'reflect-metadata';

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { GraphQLScalarType } from 'graphql';
import { DateTimeResolver } from 'graphql-scalars';
import * as tq from 'type-graphql';
import { Container } from 'typedi';
import cors from 'cors';

import {
  EMAIL_ATTACHMENT_UPLOAD_DIR,
  PAYMENT_UPLOAD_DIR,
  WEEKLY_REPORT_UPLOAD_DIR,
} from './consts';
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
import { WeeklyCommissionResolver } from './entity/weeklycommission/weeklycommission.resolver';
import { AdminNotesResolver } from './entity/adminNotes/adminNotes.resolver';
import { FileResolver } from './entity/file/file.resolver';
import { PrepaidCommissionResolver } from './entity/prepaidCommission/prepaidCommission.resolver';
import { ProofResolver } from './entity/proof/proof.resolver';
import { PaymentMethodResolver } from './entity/paymentMethod/paymentMethod.resolver';
import { PaymentMethodLinkResolver } from './entity/paymentMethodLink/paymentMethodLink.resolver';
import { NotificationResolver } from './entity/notification/notification.resolver';
import { pubSub } from './pubsub';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { NotificationClientResolver } from './entity/notification/notificationClient.resolver';
import { adminAuthorized } from './rest/middlewares/adminAuthorized.middleware';
import { WeeklyReportResolver } from './entity/weeklyReport/weeklyReport.resolver';
import { GroupSettingResolver } from './entity/groupSetting/groupSetting.resolver';
import { BalanceResolver } from './entity/balance/balance.resolver';
import { EmailResolver } from './entity/email/email.resolver';
import { RecipientResolver } from './entity/recipient/recipient.resolver';
import { authorized } from './rest/middlewares/authorized.middleware';
import { emailAccess } from './rest/middlewares/emailAccess.middleware';
import path from 'path';

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
      WeeklyCommissionResolver,
      AdminNotesResolver,
      FileResolver,
      PrepaidCommissionResolver,
      ProofResolver,
      PaymentMethodResolver,
      PaymentMethodLinkResolver,
      NotificationResolver,
      NotificationClientResolver,
      WeeklyReportResolver,
      GroupSettingResolver,
      BalanceResolver,
      EmailResolver,
      RecipientResolver,
    ],
    authChecker,
    scalarsMap: [
      { type: GraphQLScalarType, scalar: DateTimeResolver },
      { type: BigInt, scalar: BigIntScalar },
    ],
    validate: { forbidUnknownValues: false },
    // Registry 3rd party IOC container
    container: Container,
    pubSub,
  });

  const mainServer = express();
  const httpServer = createServer(mainServer);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });
  const serverCleanup = useServer(
    {
      schema,
      context,
      onConnect: (ctx) => {
        (ctx as any).req = {
          headers: Object.fromEntries(
            Object.entries({
              ...ctx.extra.request.headers,
              ...ctx.connectionParams,
            }).map(([key, value]) => [key.toLowerCase(), value])
          ),
        };
      },
    },
    wsServer
  );
  const apolloServer = new ApolloServer<Context>({
    schema,
    formatError,
    introspection: process.env.SERVER_TYPE !== 'production',
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await apolloServer.start();

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
  mainServer.use('/api', router);
  mainServer.use('/public/payment', adminAuthorized, express.static(PAYMENT_UPLOAD_DIR));
  mainServer.use(
    '/public/email/:id/attachments/:attachmentName',
    authorized,
    emailAccess(true),
    (req, res, next) => {
      const filePath = path.join(
        EMAIL_ATTACHMENT_UPLOAD_DIR,
        req.params.id,
        req.params.attachmentName
      );
      return res.sendFile(filePath);
    }
  );
  mainServer.use('/public/weeklyreports', express.static(WEEKLY_REPORT_UPLOAD_DIR));

  const APP_HOST = process.env.APP_HOST ?? '0.0.0.0';
  const APP_PORT = process.env.APP_PORT ?? 4000;
  httpServer.listen(+APP_PORT, APP_HOST, () => {
    console.log(`🚀 Server ready at: ${APP_HOST}:${APP_PORT}`);
  });
};

app();
