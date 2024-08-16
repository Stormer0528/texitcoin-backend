import { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Block } from '@/entity/block/block.entity';

// Block Query Args
@ArgsType()
export class BlockQueryArgs extends QueryArgsBase<Prisma.BlockWhereInput> {}

// Block list response with pagination ( total )
@ObjectType()
export class BlocksResponse extends PaginatedResponse {
  @Field(() => [Block], { nullable: 'itemsAndList' })
  blocks?: Block[];
}

// Create Block Input and Response
@InputType()
export class CreateBlockInput {
  @Field()
  blockNo: number;

  @Field()
  hashRate: number;

  @Field()
  difficulty: number;

  @Field()
  issuedAt: Date;
}
