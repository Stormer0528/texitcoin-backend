import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

@ObjectType()
export class FileSale extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  saleId: string;

  @Field(() => ID)
  fileId: string;
}
