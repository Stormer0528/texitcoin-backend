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
import { validateAddresses } from '@/utils/validateAddress';
import { GraphQLError } from 'graphql';
import { PAYOUTS } from '@/consts';

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
    this.validateMemberWallets(data.wallets);

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

    const [verified, invalidAddresses] = validateAddresses(
      data.wallets.map((wallet) => wallet.address)
    );
    if (!verified) {
      throw new GraphQLError(`Invalid Address - ${invalidAddresses.join(',')}`, {
        extensions: {
          path: invalidAddresses.map(
            (addr) =>
              `wallets/address[${data.wallets.findIndex((wallet) => wallet.address === addr)}]`
          ),
        },
      });
    }

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

  async createManyMemberWallets(data: CreateMemberWalletInput) {
    this.validateMemberWallets(data.wallets);

    const [verified, invalidAddresses] = validateAddresses(
      data.wallets.map((wallet) => wallet.address)
    );
    if (!verified) {
      throw new GraphQLError(`Invalid Address - ${invalidAddresses.join(',')}`, {
        extensions: {
          path: invalidAddresses.map(
            (addr) =>
              `wallets/address[${data.wallets.findIndex((wallet) => wallet.address === addr)}]`
          ),
        },
      });
    }

    const res = await this.prisma.memberWallet.createMany({
      data: data.wallets.map((wallet) => ({ ...wallet, memberId: data.memberId })),
    });

    await this.validationByMemberId(data.memberId);

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
      where: {
        memberId: id,
        deletedAt: null,
        OR: [
          {
            payoutId: PAYOUTS[0],
          },
          {
            payoutId: PAYOUTS[1],
          },
        ],
      },
    });
    if (wallets.reduce((prev, cur) => prev + cur.percent, 0) !== 100 * PERCENT)
      throw new Error('Sum of TXC percent must be 100');
    return true;
  }

  validateMemberWallets(wallets?: MemberWalletDataInput[], onlySum: boolean = false): boolean {
    if (wallets) {
      const txcWallets = wallets.filter((wallet, index) => {
        if (!wallet.payoutId) {
          throw new GraphQLError('Not specified payout type', {
            extensions: {
              path: [`wallets[${index}]`],
            },
          });
        } else if (!wallet.address) {
          throw new GraphQLError('Not specified wallet address', {
            extensions: {
              path: [`wallets[${index}]`],
            },
          });
        }
        return wallet.payoutId === PAYOUTS[0] || wallet.payoutId === PAYOUTS[1];
      });

      if (!txcWallets.length) {
        throw new GraphQLError('At leat one txc wallet has to be existed', {
          extensions: {
            path: ['wallets'],
          },
        });
      }
      const sumPercent = txcWallets.reduce((prev, current) => {
        return prev + current.percent;
      }, 0);

      if (sumPercent !== 100 * PERCENT) throw new Error('Sum of TXC percent must be 100');
    } else if (!onlySum) {
      throw new GraphQLError('No wallet data', {
        extensions: {
          path: ['wallets'],
        },
      });
    }
    return true;
  }
}
