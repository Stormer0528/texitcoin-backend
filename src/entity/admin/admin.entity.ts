import { ObjectType, Field, ID, Authorized } from 'type-graphql';
import { IsEmail, IsUrl } from 'class-validator';

import { BaseEntity } from '@/graphql/baseEntity';
import { UserRole } from '@/type';
import { AdminNotes } from '../adminNotes/adminNotes.entity';

@ObjectType()
export class Admin extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  @IsEmail()
  email: string;

  password?: string;

  @Field()
  @IsUrl()
  avatar: string;

  @Authorized([UserRole.Admin])
  @Field(() => [AdminNotes], { nullable: 'itemsAndList' })
  adminNotes?: AdminNotes[];
}
