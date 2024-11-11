import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

@ObjectType()
export class FileCommission extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  commissionId: string;

  @Field(() => ID)
  fileId: string;
}
