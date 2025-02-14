import { Inject, Service } from 'typedi';
import {
  Arg,
  Args,
  Resolver,
  Query,
  Mutation,
  Authorized,
  Ctx,
  Info,
  FieldResolver,
  Root,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo, print } from 'graphql';

import { DEFAULT_PASSWORD } from '@/consts';
import { type Context } from '@/context';
import { UserRole } from '@/type';
import { createAccessToken, verifyPassword, hashPassword } from '@/utils/auth';

import {
  EmailInput,
  IDsInput,
  ManySuccessResponse,
  ResetPasswordTokenInput,
  SuccessResponse,
  TokenInput,
  VerifyTokenResponse,
} from '@/graphql/common.type';
import {
  AdminLoginInput,
  AdminLoginResponse,
  AdminQueryArgs,
  AdminsResponse,
  CreateAdminInput,
  UpdateAdminInput,
  UpdateAdminPasswordByIdInput,
  UpdateAdminPasswordInput,
} from './admin.type';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { AdminNotes } from '../adminNotes/adminNotes.entity';
import { SuccessResult } from '@/graphql/enum';
import { MailerService } from '@/service/mailer';

@Service()
@Resolver(() => Admin)
export class AdminResolver {
  constructor(
    private readonly service: AdminService,
    @Inject(() => MailerService)
    private readonly mailService: MailerService
  ) {}

  @Authorized([UserRole.ADMIN])
  @Query(() => AdminsResponse)
  async admins(
    @Args() query: AdminQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<AdminsResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; admins?: Promise<Admin[]> } = {};

    if ('total' in fields) {
      promises.total = this.service.getAdminsCount(query);
    }

    if ('admins' in fields) {
      promises.admins = this.service.getAdmins(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; users?: Admin[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.ADMIN])
  @Query(() => Admin)
  async adminMe(@Ctx() ctx: Context): Promise<Admin> {
    return ctx.user! as Admin;
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => Admin)
  async createAdmin(@Arg('data') data: CreateAdminInput): Promise<Admin> {
    // Hash the password
    const hashedPassword = await hashPassword(data.password ?? DEFAULT_PASSWORD);
    return this.service.createAdmin({ ...data, password: hashedPassword });
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => Admin)
  async updateAdmin(@Ctx() ctx: Context, @Arg('data') data: UpdateAdminInput): Promise<Admin> {
    return this.service.updateAdmin({
      id: ctx.user.id,
      ...data,
    });
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => SuccessResponse)
  async updatePasswordAdmin(
    @Ctx() ctx: Context,
    @Arg('data') data: UpdateAdminPasswordInput
  ): Promise<SuccessResponse> {
    const user = await this.service.getAdminById(ctx.user.id);

    const isValidPassword = await verifyPassword(data.oldPassword, user.password);

    if (!isValidPassword) {
      return {
        result: SuccessResult.failed,
        message: 'password doesn not match',
      };
    }

    const hashedPassword = await hashPassword(data.newPassword);
    await this.service.updatePassword({ id: user.id, password: hashedPassword });

    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => Admin)
  async updatePasswordAdminById(@Arg('data') data: UpdateAdminPasswordByIdInput): Promise<Admin> {
    const hashedPassword = await hashPassword(data.newPassword);
    return this.service.updatePassword({ id: data.id, password: hashedPassword });
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => ManySuccessResponse)
  async removeAdmins(@Arg('data') data: IDsInput): Promise<ManySuccessResponse> {
    const { count } = await this.service.removeAdmins(data);

    return { count };
  }

  @Mutation(() => AdminLoginResponse)
  async adminLogin(@Arg('data') data: AdminLoginInput): Promise<AdminLoginResponse> {
    const user = await this.service.getAdminByEmail(data.email);

    if (!user) {
      throw new Error('Invalid credentials are provided');
    }

    const isValidPassword = await verifyPassword(data.password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials are provided');
    }

    return {
      accessToken: createAccessToken({ id: user.id, isAdmin: true }),
    };
  }

  @Mutation(() => SuccessResponse)
  async adminResetPasswordRequest(@Arg('data') data: EmailInput): Promise<SuccessResponse> {
    const { token, email, username } = await this.service.generateResetTokenByEmail(data);
    if (token) {
      this.mailService.sendForgetPasswordLink(
        email,
        username,
        `${process.env.ADMIN_URL}/reset-password?token=${token}`
      );
      return {
        result: SuccessResult.success,
      };
    } else {
      return {
        result: SuccessResult.failed,
        message: 'Creating token failed',
      };
    }
  }

  @Mutation(() => SuccessResponse)
  async adminResetPasswordByToken(
    @Arg('data') data: ResetPasswordTokenInput
  ): Promise<SuccessResponse> {
    await this.service.resetPasswordByToken(data);
    return {
      result: SuccessResult.success,
    };
  }

  @Mutation(() => VerifyTokenResponse)
  async adminResetTokenVerify(@Arg('data') data: TokenInput): Promise<VerifyTokenResponse> {
    return this.service.verifyAndUpdateToken(data);
  }

  @Authorized([UserRole.ADMIN])
  @FieldResolver(() => [AdminNotes])
  async adminNotes(@Root() admin: Admin, @Ctx() ctx: Context) {
    return ctx.dataLoader.get('adminNotesForAdminLoader').load(admin.id);
  }
}
