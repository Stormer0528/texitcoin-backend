import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID, Int } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { GroupSetting } from './groupSetting.entity';

// Group Setting Query Args
@ArgsType()
export class GroupSettingQueryArgs extends QueryArgsBase<Prisma.GroupSettingWhereInput> {}

// Group Setting list response with pagination ( total )
@ObjectType()
export class GroupSettingResponse extends PaginatedResponse {
  @Field(() => [GroupSetting], { nullable: true })
  groupSettings?: GroupSetting[];
}

// Create Group Setting Input and Response
@InputType()
export class CreateGroupSettingInput {
  @Field()
  name: string;

  @Field()
  limitDate: Date;

  @Field(() => ID, { nullable: true })
  sponsorBonusPackageId?: string;

  @Field(() => ID, { nullable: true })
  rollSponsorBonusPackageId?: string;

  @Field(() => [CreateGroupSettingCommissionBonusInput])
  groupSettingCommissionBonuses: CreateGroupSettingCommissionBonusInput[];
}

@InputType()
export class CreateGroupSettingCommissionBonusInput {
  @Field(() => Int)
  lPoint: number;

  @Field(() => Int)
  rPoint: number;

  @Field(() => Int)
  commission: number;
}

@InputType()
export class UpdateGroupSettingInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  limitDate?: Date;

  @Field(() => ID, { nullable: true })
  sponsorBonusPackageId?: string;

  @Field(() => ID, { nullable: true })
  rollSponsorBonusPackageId?: string;

  @Field(() => [CreateGroupSettingCommissionBonusInput], { nullable: true })
  groupSettingCommissionBonuses: CreateGroupSettingCommissionBonusInput[];
}
