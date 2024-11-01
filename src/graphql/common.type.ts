import { IsEmail } from 'class-validator';
import { Field, ID, InputType, ObjectType } from 'type-graphql';
import { SuccessResult } from './enum';

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
export class SuccessResponse {
  @Field(() => SuccessResult)
  result: SuccessResult;

  @Field({ nullable: true })
  message?: string;
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
