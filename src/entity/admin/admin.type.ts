import type { Prisma } from '@prisma/client';
import { IsEmail, IsUrl } from 'class-validator';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Admin } from './admin.entity';

// User Query Args
@ArgsType()
export class AdminQueryArgs extends QueryArgsBase<Prisma.AdminWhereInput> {}

// User list response with pagination ( total )
@ObjectType()
export class AdminsResponse extends PaginatedResponse {
  @Field(() => [Admin], { nullable: 'itemsAndList' })
  admins?: Admin[];
}

// Create User Input and Response
@InputType()
export class CreateAdminInput {
  @Field()
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  @IsUrl()
  avatar?: string;
}

@InputType()
export class UpdateAdminInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  @IsUrl()
  avatar?: string;
}

@InputType()
export class UpdateAdminPasswordInput {
  @Field()
  oldPassword: string;

  @Field()
  newPassword: string;
}

@InputType()
export class UpdateAdminPasswordByIdInput {
  @Field(() => ID)
  id?: string;

  @Field()
  newPassword: string;
}

// Login Input and Response

@InputType()
export class AdminLoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class AdminLoginResponse {
  @Field()
  accessToken: string;
}
