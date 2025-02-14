import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { MemberWallet } from '../memberWallet/memberWallet.entity';

@ObjectType()
export class Payout extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  method: string;

  @Field()
  status: boolean;

  @Field()
  name: string;

  @Field()
  display: string;

  @Field(() => [MemberWallet], { nullable: true })
  memberWallets?: MemberWallet[];
}
