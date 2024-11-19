import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

@ObjectType()
export class FileRelation extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  saleId?: string;

  @Field(() => ID, { nullable: true })
  commissionId?: string;

  @Field(() => ID, { nullable: true })
  prepaidCommissionId?: string;

  @Field(() => ID, { nullable: true })
  proofId?: string;

  @Field(() => ID)
  fileId: string;
}
