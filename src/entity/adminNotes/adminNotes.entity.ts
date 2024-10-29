import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Admin } from '../admin/admin.entity';

@ObjectType()
export class AdminNotes extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field()
  adminId: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Member, { nullable: true })
  member?: Member;

  @Field(() => Admin, { nullable: true })
  admin?: Admin;
}
