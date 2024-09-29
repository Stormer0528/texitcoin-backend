import { Service, Inject } from 'typedi';
import Bluebird from 'bluebird';

import { PERCENT } from '@/consts/db';
import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import {
  CreateMemberWalletInput,
  MemberWalletDataInput,
  MemberWalletQueryArgs,
  UpdateMemberWalletInput,
} from './memberWallet.type';

@Service()
export class MemberWalletService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getMemberWallets(params: MemberWalletQueryArgs) {
    return await this.prisma.memberWallet.findMany({
      where: {
        ...params.where,
        deletedAt: null,
      },
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getMemberWalletsCount(params: MemberWalletQueryArgs): Promise<number> {
    return this.prisma.memberWallet.count({
      where: {
        ...params.where,
        deletedAt: null,
      },
    });
  }

  async getMemberWalletById(id: string) {
    return this.prisma.memberWallet.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async updateManyMemberWallet(data: UpdateMemberWalletInput) {
    const sumPercent = data.wallets.reduce((prev, current) => {
      if (!current.payoutId) {
        throw new Error('Not specified payout type');
      } else if (!current.address) {
        throw new Error('Not specified wallet address');
      }
      return prev + current.percent;
    }, 0);

    if (sumPercent !== 100 * PERCENT) throw new Error('Sum of percent must be 100');

    await this.prisma.memberWallet.updateMany({
      where: {
        memberId: data.memberId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    const unionSameWallet: Record<string, MemberWalletDataInput> = {};
    data.wallets.forEach((wallet) => {
      const ky = `${wallet.payoutId}-${wallet.address}`;
      if (!unionSameWallet[ky]) unionSameWallet[ky] = wallet;
      else unionSameWallet[ky].percent += wallet.percent;
    });

    await Bluebird.map(
      Object.values(unionSameWallet),
      async (wallet) => {
        await this.prisma.memberWallet.upsert({
          where: {
            memberId_payoutId_address: {
              memberId: data.memberId,
              address: wallet.address,
              payoutId: wallet.payoutId,
            },
          },
          update: {
            ...wallet,
            deletedAt: null,
          },
          create: {
            ...wallet,
            memberId: data.memberId,
          },
        });
      },
      { concurrency: 10 }
    );
    await this.validationByMemberId(data.memberId);
  }

  async createManyMemberWallets(data: CreateMemberWalletInput[]) {
    const sumPercent = data.reduce((prev, current) => {
      if (!current.payoutId) {
        throw new Error('Not specified payout type');
      } else if (!current.address) {
        throw new Error('Not specified wallet address');
      }
      return prev + current.percent;
    }, 0);

    if (sumPercent !== 100 * PERCENT) throw new Error('Sum of percent must be 100');

    const res = await this.prisma.memberWallet.createMany({
      data,
    });

    await Bluebird.map(
      [...new Set(data.map((dt) => dt.memberId))],
      async (memberId) => {
        await this.validationByMemberId(memberId);
      },
      { concurrency: 10 }
    );

    return res;
  }

  async removeMemberWalletsByMemberId(data: IDInput) {
    return this.prisma.memberWallet.deleteMany({
      where: {
        memberId: data.id,
      },
    });
  }

  async validationByMemberId(id: string) {
    const wallets = await this.prisma.memberWallet.findMany({
      where: { memberId: id, deletedAt: null },
    });
    if (wallets.reduce((prev, cur) => prev + cur.percent, 0) !== 100 * PERCENT)
      throw new Error('Sum of percent should be 100');
    return true;
  }
}
