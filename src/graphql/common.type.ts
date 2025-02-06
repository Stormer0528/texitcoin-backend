import { IsEmail } from 'class-validator';
import { Field, ID, InputType, ObjectType } from 'type-graphql';
import { FrontActionEnum, SuccessResult } from './enum';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class IDInput {
  @Field(() => ID)
  id: string;
}

@InputType()
export class IDsInput {
  @Field(() => [ID])
  ids: string[];
}

@InputType()
export class EmailInput {
  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class TokenInput {
  @Field()
  token: string;
}

@ObjectType()
export class ManySuccessResponse {
  @Field()
  count: number;
}

@ObjectType()
export class CountResponse {
  @Field()
  count: number;
}

@InputType()
export class ResetPasswordTokenInput {
  @Field()
  token: string;

  @Field()
  password: string;
}

@ObjectType()
export class VerifyTokenResponse {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  token: string;
}

@ObjectType()
export class FrontAction {
  @Field(() => FrontActionEnum)
  action: FrontActionEnum;

  @Field()
  message: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  extra?: any;
}

@ObjectType()
export class FrontActionBasic {
  @Field(() => [FrontAction], { nullable: null })
  frontActions?: FrontAction[];
}

@ObjectType()
export class SuccessResponse extends FrontActionBasic {
  @Field(() => SuccessResult)
  result: SuccessResult;

  @Field({ nullable: true })
  message?: string;
}
