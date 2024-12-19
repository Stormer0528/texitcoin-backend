import { ObjectType, Field, ID, Int } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

@ObjectType()
export class GroupSetting extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  limitDate: Date;

  @Field()
  sponsorBonusPackageId: string;

  @Field(() => [GroupSettingCommissionBonus])
  groupSettingCommissionBonuses?: GroupSettingCommissionBonus[];
}

@ObjectType()
export class GroupSettingCommissionBonus extends BaseEntity {
  @Field(() => Int)
  lPoint: number;

  @Field(() => Int)
  rPoint: number;

  @Field(() => Int)
  commission: number;
}
