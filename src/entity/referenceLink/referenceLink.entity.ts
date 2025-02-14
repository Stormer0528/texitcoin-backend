import { ObjectType, Field, ID } from 'type-graphql';
import { IsUrl } from 'class-validator';

import { BaseEntity } from '@/graphql/baseEntity';

@ObjectType()
export class ReferenceLink extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  proofId: string;

  @Field()
  linkType: string;

  @Field()
  link: string;
}

@ObjectType()
export class RefLink {
  @Field()
  linkType: string;

  @Field()
  @IsUrl()
  link: string;
}
