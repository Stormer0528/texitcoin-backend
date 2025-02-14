import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

@ObjectType()
export class EmailAttachment extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  emailId: string;

  @Field(() => ID)
  fileId: string;
}
