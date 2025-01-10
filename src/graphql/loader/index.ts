// Inspired by Parabol Dataloader implementation
import DataLoader from 'dataloader';

import { PrismaService } from '@/service/prisma';

import * as memberLoader from './memberLoader';
import * as memberStatisticsLoader from './memberStatisticsLoader';
import * as saleLoader from './saleLoader';
import * as statisticsLoader from './statisticsLoader';
import * as packageLoader from './packageLoader';
import * as payoutLoader from './payoutLoader';
import * as statisticsSaleLoader from './statisticsSaleLoader';
import * as memberStatisticsWalletLoader from './memberStatisticsWalletLoader';
import * as memberWalletLoader from './memberWalletLoader';
import * as weeklyCommissionLoader from './weeklyCommissionLoader';
import * as adminNotesLoader from './adminNotesLoader';
import * as adminLoader from './adminLoader';
import * as prepaidCommissionLoader from './prepaidCommissionLoader';
import * as proofLoader from './proofLoader';
import * as paymentMethodLoader from './paymentMethodLoader';
import * as paymentMethodLinkLoader from './paymentMethodLinkLoader';
import * as notificationLoader from './notificationLoader';
import * as weeklyReportLoader from './weeklyReportLoader';
import * as groupSettingLoader from './groupSettingLoader';
import * as balanceLoader from './balanceLoader';
import * as emailLoader from './emailLoader';
import * as recipientLoader from './recipientLoader';
import { Member } from '@/entity/member/member.entity';
import { Admin } from '@/entity/admin/admin.entity';

interface LoaderDict {
  [loaderName: string]: DataLoader<any, any>;
}

// Register all loaders
const loaderMakers = {
  ...memberLoader,
  ...memberStatisticsLoader,
  ...saleLoader,
  ...statisticsLoader,
  ...packageLoader,
  ...payoutLoader,
  ...statisticsSaleLoader,
  ...memberStatisticsWalletLoader,
  ...memberWalletLoader,
  ...weeklyCommissionLoader,
  ...adminLoader,
  ...adminNotesLoader,
  ...prepaidCommissionLoader,
  ...proofLoader,
  ...paymentMethodLoader,
  ...paymentMethodLinkLoader,
  ...notificationLoader,
  ...weeklyReportLoader,
  ...groupSettingLoader,
  ...balanceLoader,
  ...emailLoader,
  ...recipientLoader,
} as const;

type LoaderMakers = typeof loaderMakers;
export type Loaders = keyof LoaderMakers;

type CustomLoaderMakers = typeof loaderMakers;

type CustomLoaders = keyof CustomLoaderMakers;
type Uncustom<T> = T extends (parent: RootDataLoader) => infer U ? U : never;
type TypeFromCustom<T extends CustomLoaders> = Uncustom<CustomLoaderMakers[T]>;

// Use this if you don't need the dataloader to be shareable
export interface DataLoaderInstance {
  get<LoaderName extends Loaders>(loaderName: LoaderName): TypeFromCustom<LoaderName>;
}

/**
 * This is the main dataloader
 */
export default class RootDataLoader implements DataLoaderInstance {
  readonly prisma: PrismaService;
  readonly user: Member | Admin;
  readonly isAdmin: boolean;

  dataLoaderOptions: DataLoader.Options<any, any>;
  // casted to any because access to the loaders will results in a creation if needed
  loaders: LoaderDict = {} as any;

  constructor(
    prisma: PrismaService,
    dataLoaderOptions: DataLoader.Options<any, any> = {},
    user: Member | Admin,
    isAdmin: boolean
  ) {
    this.prisma = prisma;
    this.dataLoaderOptions = dataLoaderOptions;
    this.user = user;
    this.isAdmin = isAdmin;
  }

  get<LoaderName extends Loaders>(loaderName: LoaderName): TypeFromCustom<LoaderName> {
    const loader = this.loaders[loaderName];

    if (loader) {
      return loader as TypeFromCustom<LoaderName>;
    }
    const loaderMaker = loaderMakers[loaderName];

    this.loaders[loaderName] = loaderMaker(this);

    return this.loaders[loaderName] as TypeFromCustom<LoaderName>;
  }
}
