import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

@ObjectType()
export class FileRelation extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  proofId: string;

  @Field(() => ID)
  fileId: string;
}
