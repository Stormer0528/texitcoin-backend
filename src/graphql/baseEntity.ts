import { ObjectType, Field, ID } from 'type-graphql';
import { FrontActionBasic } from './common.type';

@ObjectType()
export class BaseEntity extends FrontActionBasic {
  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
