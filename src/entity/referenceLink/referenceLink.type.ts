import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { ReferenceLink } from './referenceLink.entity';
import { IsUrl } from 'class-validator';

// ReferenceLink Query Args
@ArgsType()
export class ReferenceLinkQueryArgs extends QueryArgsBase<Prisma.ReferenceLinkWhereInput> {}

// ReferenceLink list response with pagination ( total )
@ObjectType()
export class ReferenceLinkResponse extends PaginatedResponse {
  @Field(() => [ReferenceLink], { nullable: 'itemsAndList' })
  referenceLinks?: ReferenceLink[];
}

// Create ReferenceLink Input and Response
@InputType()
export class CreateReferenceLinkInput {
  @Field(() => ID, { nullable: true })
  saleId?: string;

  @Field(() => ID, { nullable: true })
  commissionId?: string;

  @Field(() => ID, { nullable: true })
  prepaidCommissionId?: string;

  @Field()
  linkType: string;

  @Field()
  link: string;
}

@InputType()
export class UpdateReferenceLinkInput {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  saleId?: string;

  @Field(() => ID, { nullable: true })
  commissionId?: string;

  @Field(() => ID, { nullable: true })
  prepaidCommissionId?: string;

  @Field({ nullable: true })
  linkType?: string;

  @Field({ nullable: true })
  link?: string;
}

@InputType()
export class LinkInput {
  @Field()
  linkType: string;

  @Field()
  @IsUrl()
  link: string;
}
