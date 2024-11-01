import { Service } from 'typedi';
import {
  Arg,
  Args,
  Resolver,
  Query,
  Mutation,
  Info,
  Authorized,
  Ctx,
  FieldResolver,
  Root,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { UserRole } from '@/type';
import { Context } from '@/context';

import { Transaction } from '@/graphql/decorator';
import { IDInput, SuccessResponse } from '@/graphql/common.type';
import {
  AdminNotesQueryArgs,
  AdminNotesResponse,
  CreateAdminNotesInput,
  UpdateAdminNotesInput,
} from './adminNotes.type';
import { AdminNotesService } from './adminNotes.service';
import { AdminNotes } from './adminNotes.entity';
import { Member } from '../member/member.entity';
import { Admin } from '../admin/admin.entity';
import { SuccessResult } from '@/graphql/enum';

@Service()
@Resolver(() => AdminNotes)
export class AdminNotesResolver {
  constructor(private readonly service: AdminNotesService) {}

  @Authorized([UserRole.Admin])
  @Query(() => AdminNotesResponse)
  async adminNotes(
    @Args() query: AdminNotesQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<AdminNotesResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; adminNotes?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getAdminNotesCount(query);
    }

    if ('adminNotes' in fields) {
      promises.adminNotes = this.service.getAdminNotes(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; adminNotes?: AdminNotes[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => AdminNotes)
  async createAdminNote(
    @Ctx() ctx: Context,
    @Arg('data') data: CreateAdminNotesInput
  ): Promise<AdminNotes> {
    return this.service.createAdminNote({
      ...data,
      adminId: ctx.user.id,
    });
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => AdminNotes)
  async updateAdminNote(@Arg('data') data: UpdateAdminNotesInput): Promise<AdminNotes> {
    return this.service.updateAdminNote(data);
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => SuccessResponse)
  async removeAdminNote(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.service.removeAdminNote(data);
    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.Admin])
  @FieldResolver(() => Member)
  async member(@Root() adminNote: AdminNotes, @Ctx() ctx: Context): Promise<Member> {
    return ctx.dataLoader.get('memberForAdminNotesLoader').load(adminNote.memberId);
  }

  @Authorized([UserRole.Admin])
  @FieldResolver(() => Admin)
  async admin(@Root() adminNote: AdminNotes, @Ctx() ctx: Context): Promise<Admin> {
    return ctx.dataLoader.get('adminForAdminNotesLoader').load(adminNote.adminId);
  }
}
