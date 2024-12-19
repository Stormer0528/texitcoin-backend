import { Service } from 'typedi';
import {
  Arg,
  Args,
  Resolver,
  Query,
  Mutation,
  Info,
  Authorized,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { UserRole } from '@/type';

import { Transaction } from '@/graphql/decorator';
import { IDInput, SuccessResponse } from '@/graphql/common.type';
import {
  CreateGroupSettingInput,
  GroupSettingQueryArgs,
  GroupSettingResponse,
  UpdateGroupSettingInput,
} from './groupSetting.type';
import { GroupSetting, GroupSettingCommissionBonus } from './groupSetting.entity';
import { GroupSettingService } from './groupSetting.service';
import { Context } from '@/context';

@Service()
@Resolver(() => GroupSetting)
export class GroupSettingResolver {
  constructor(private readonly service: GroupSettingService) {}

  @Authorized([UserRole.ADMIN])
  @Query(() => GroupSettingResponse)
  async groupSettings(
    @Args() query: GroupSettingQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<GroupSettingResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; groupSettings?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getGroupSettingCount(query);
    }

    if ('groupSettings' in fields) {
      promises.groupSettings = this.service.getGroupSettings(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; groupSettings?: GroupSetting[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => GroupSetting)
  async createGroupSetting(@Arg('data') data: CreateGroupSettingInput): Promise<GroupSetting> {
    return this.service.createGroupSetting(data);
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => GroupSetting)
  async updateGroupSetting(@Arg('data') data: UpdateGroupSettingInput): Promise<GroupSetting> {
    return this.service.updateGroupSetting(data);
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => GroupSetting)
  async removeGroupSetting(@Arg('data') data: IDInput): Promise<GroupSetting> {
    return this.service.removeGroupSetting(data);
  }

  @Authorized([UserRole.ADMIN])
  @FieldResolver(() => [GroupSettingCommissionBonus], { nullable: true })
  async groupSettingCommissionBonuses(
    @Root() groupSetting: GroupSetting,
    @Ctx() ctx: Context
  ): Promise<GroupSettingCommissionBonus[]> {
    return ctx.dataLoader
      .get('groupSettingCommissionBonusesForGroupSettingLoader')
      .load(groupSetting.id);
  }
}
