import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Package } from './package.entity';

// Package Query Args
@ArgsType()
export class PackageQueryArgs extends QueryArgsBase<Prisma.PackageWhereInput> {}

// Package list response with pagination ( total )
@ObjectType()
export class PackageResponse extends PaginatedResponse {
  @Field(() => [Package], { nullable: 'itemsAndList' })
  packages?: Package[];
}

// Create Package Input and Response
@InputType()
export class CreatePackageInput {
  @Field()
  productName: string;

  @Field()
  amount: number;

  @Field()
  status: boolean;

  @Field({ nullable: true })
  date?: Date;

  @Field()
  token: number;

  @Field({ nullable: true })
  point?: number;

  @Field()
  isFreeShare: boolean;
}

@InputType()
export class UpdatePackageInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  productName?: string;

  @Field({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  status?: boolean;

  @Field({ nullable: true })
  date?: Date;

  @Field({ nullable: true })
  token?: number;

  @Field({ nullable: true })
  point?: number;

  @Field({ nullable: true })
  isFreeShare?: boolean;
}
