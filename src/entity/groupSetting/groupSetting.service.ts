import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import {
  CreateGroupSettingInput,
  GroupSettingQueryArgs,
  UpdateGroupSettingInput,
} from './groupSetting.type';
import { GroupSettingCommissionBonus } from './groupSetting.entity';
import { GraphQLError } from 'graphql';
import { LIMIT_COMMISSION_L_POINT, LIMIT_COMMISSION_R_POINT } from '@/consts';

@Service()
export class GroupSettingService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getGroupSettings(params: GroupSettingQueryArgs) {
    return await this.prisma.groupSetting.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getGroupSettingCount(params: Pick<GroupSettingQueryArgs, 'where'>): Promise<number> {
    return this.prisma.groupSetting.count({
      where: params.where,
    });
  }

  async createGroupSetting(data: CreateGroupSettingInput) {
    const { groupSettingCommissionBonuses, ...rest } = data;
    const { result, message } = this.validateGroupSettingCommissionBonus(
      groupSettingCommissionBonuses
    );
    if (result) {
      throw new GraphQLError(message, {
        extensions: {
          path: 'groupSettingCommissionBonuses',
        },
      });
    }

    return this.prisma.groupSetting.create({
      data: {
        ...rest,
        groupSettingCommissionBonuses: {
          createMany: {
            data: groupSettingCommissionBonuses,
            skipDuplicates: true,
          },
        },
      },
    });
  }

  async updateGroupSetting(data: UpdateGroupSettingInput) {
    const { groupSettingCommissionBonuses, ...rest } = data;
    if (groupSettingCommissionBonuses) {
      const { result, message } = this.validateGroupSettingCommissionBonus(
        groupSettingCommissionBonuses
      );
      if (result) {
        throw new GraphQLError(message, {
          extensions: {
            path: 'groupSettingCommissionBonuses',
          },
        });
      }

      await this.prisma.groupSettingCommissionBonus.deleteMany({
        where: {
          groupSettingId: data.id,
        },
      });
      await this.prisma.groupSettingCommissionBonus.createMany({
        data: groupSettingCommissionBonuses.map((commissionBonus) => ({
          ...commissionBonus,
          groupSettingId: data.id,
        })),
      });
    }
    return this.prisma.groupSetting.update({
      where: {
        id: data.id,
      },
      data: rest,
    });
  }

  async removeGroupSetting(data: IDInput) {
    await this.prisma.groupSettingCommissionBonus.deleteMany({
      where: {
        groupSettingId: data.id,
      },
    });
    return this.prisma.groupSetting.delete({
      where: {
        id: data.id,
      },
    });
  }

  private validateGroupSettingCommissionBonus(data: GroupSettingCommissionBonus[]) {
    const maxLimit = data.find(
      (bonus) => bonus.lPoint > LIMIT_COMMISSION_L_POINT || bonus.rPoint > LIMIT_COMMISSION_R_POINT
    );
    if (maxLimit) {
      return {
        result: 2,
        message: `The commission bonus L, R points are maximum ${LIMIT_COMMISSION_L_POINT}, ${LIMIT_COMMISSION_R_POINT}`,
      }; // Max Limit Exceed
    }
    const sortedData = data.sort((bonus1, bonus2) =>
      bonus1.lPoint !== bonus2.lPoint
        ? bonus1.lPoint - bonus2.lPoint
        : bonus1.rPoint - bonus2.rPoint
    );
    for (let i = 1; i < sortedData.length; i++) {
      if (
        !(
          (sortedData[i - 1].lPoint < sortedData[i].lPoint &&
            sortedData[i - 1].rPoint <= sortedData[i].rPoint) ||
          (sortedData[i - 1].lPoint === sortedData[i].lPoint &&
            sortedData[i - 1].rPoint < sortedData[i].rPoint)
        )
      ) {
        return {
          result: 1,
          message: 'The commission bonus structure should be adjusted to higher values.',
        };
      }
    }
    return { result: 0, message: '' };
  }
}
