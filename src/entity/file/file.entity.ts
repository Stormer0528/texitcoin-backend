import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

@ObjectType()
export class File extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field()
  originalName: string;

  @Field()
  mimeType: string;

  @Field()
  size: number;

  @Field({ nullable: true })
  localPath: string;
}
