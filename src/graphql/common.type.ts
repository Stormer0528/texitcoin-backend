import { IsEmail } from 'class-validator';
import { createUnionType, Field, ID, InputType, Int, ObjectType } from 'type-graphql';
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
export class FrontActionCreate12FreeBonusSale {
  @Field(() => FrontActionEnum)
  type: FrontActionEnum;

  @Field(() => ID)
  memberId: string;

  @Field(() => ID)
  packageId: string;

  @Field()
  paymentMethod: string;

  @Field(() => Int)
  sponsorCnt: number;

  @Field(() => Boolean)
  isWithinSponsorRollDuration: boolean;
}

@ObjectType()
export class FrontActionUpdate12FreeBonusSale {
  @Field(() => FrontActionEnum)
  type: FrontActionEnum;

  @Field(() => ID)
  id: string;

  @Field(() => ID)
  oldPackageId: string;

  @Field(() => ID)
  newPackageId: string;

  @Field(() => Boolean)
  status: boolean;
}

@ObjectType()
export class FrontActionRemove12FreeBonusSale {
  @Field(() => FrontActionEnum)
  type: FrontActionEnum;

  @Field(() => ID)
  id: string;
}

export const FrontActionExtraTypes = createUnionType({
  name: 'FrontActionExtra',
  types: () =>
    [
      FrontActionCreate12FreeBonusSale,
      FrontActionUpdate12FreeBonusSale,
      FrontActionRemove12FreeBonusSale,
    ] as const,
  resolveType: ({ type }) => {
    switch (type) {
      case FrontActionEnum.CREATE12FREEBONUSSALE:
        return FrontActionCreate12FreeBonusSale;
      case FrontActionEnum.UPDATE12FREEBONUSSALE:
        return FrontActionUpdate12FreeBonusSale;
      case FrontActionEnum.REMOVE12FREEBONUSSALE:
        return FrontActionRemove12FreeBonusSale;
    }
    return undefined;
  },
});

@ObjectType()
export class FrontAction {
  @Field(() => FrontActionEnum)
  action: FrontActionEnum;

  @Field()
  message: string;

  @Field(() => FrontActionExtraTypes, { nullable: true })
  extra?: typeof FrontActionExtraTypes;
}

@ObjectType()
export class FrontActionBasic {
  @Field(() => FrontAction, { nullable: null })
  frontAction?: FrontAction;
}

@ObjectType()
export class SuccessResponse extends FrontActionBasic {
  @Field(() => SuccessResult)
  result: SuccessResult;

  @Field({ nullable: true })
  message?: string;
}
