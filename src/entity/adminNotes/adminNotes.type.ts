import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { AdminNotes } from './adminNotes.entity';

// AdminNotes Query Args
@ArgsType()
export class AdminNotesQueryArgs extends QueryArgsBase<Prisma.AdminNotesWhereInput> {}

// AdminNotes list response with pagination ( total )
@ObjectType()
export class AdminNotesResponse extends PaginatedResponse {
  @Field(() => [AdminNotes], { nullable: 'itemsAndList' })
  adminNotes?: AdminNotes[];
}

// Create AdminNotes Input and Response
@InputType()
export class CreateAdminNotesInput {
  @Field(() => ID)
  memberId: string;

  @Field()
  description: string;
}

@InputType()
export class UpdateAdminNotesInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  description?: string;
}
