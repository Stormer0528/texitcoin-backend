import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import {
  CreateGroupSettingInput,
  GroupSettingQueryArgs,
  UpdateGroupSettingInput,
} from './groupSetting.type';

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
}
