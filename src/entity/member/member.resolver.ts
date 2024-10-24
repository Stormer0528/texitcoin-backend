import _ from 'lodash';
import { Inject, Service } from 'typedi';
import {
  Arg,
  Args,
  Resolver,
  Query,
  Mutation,
  Authorized,
  Info,
  FieldResolver,
  Ctx,
  Root,
  UseMiddleware,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';

import { DEFAULT_PASSWORD, PLACEMENT_ROOT } from '@/consts';
import { UserRole } from '@/type';
import { Context } from '@/context';
import { createAccessToken, hashPassword, verifyPassword } from '@/utils/auth';
import { MailerService } from '@/service/mailer';
import { minerLog } from '@/graphql/middlewares';
import { Transaction } from '@/graphql/decorator';

import {
  CountResponse,
  EmailInput,
  IDInput,
  SuccessResponse,
  SuccessResult,
  TokenInput,
} from '../../graphql/common.type';
import {
  MembersResponse,
  MemberQueryArgs,
  CreateMemberInput,
  UpdateMemberInput,
  MemberLoginResponse,
  MemberLoginInput,
  UpdateMemberPasswordInput,
  UpdateMemberPasswordInputById,
  ResetPasswordTokenInput,
  VerifyTokenResponse,
  MemberOverview,
  MemberOverviewInput,
  PlacementPositionCountResponse,
  MemberLog,
  ReferenceLink,
  SignupFormInput,
  EmailVerificationResponse,
  EmailVerificationInput,
  IntroducersResponse,
  Introducer,
} from './member.type';
import { Member } from './member.entity';
import { Sale } from '../sale/sale.entity';
import { MemberStatistics } from '../memberStatistics/memberStatistics.entity';
import { MemberWallet } from '../memberWallet/memberWallet.entity';
import { WeeklyCommission } from '../weeklycommission/weeklycommission.entity';
import { MemberService } from './member.service';
import { MemberWalletService } from '../memberWallet/memberWallet.service';
import { SaleService } from '../sale/sale.service';
import { MemberStatisticsService } from '../memberStatistics/memberStatistics.service';
import { userPermission } from '../admin/admin.permission';
import { PERCENT } from '@/consts/db';
import { ElasticSearchService } from '@/service/elasticsearch';
import { SendyService } from '@/service/sendy';

@Service()
@Resolver(() => Member)
export class MemberResolver {
  constructor(
    private readonly service: MemberService,
    private readonly memberWalletService: MemberWalletService,
    private readonly memberStatisticsService: MemberStatisticsService,
    private readonly saleService: SaleService,
    @Inject(() => ElasticSearchService)
    private readonly elasticService: ElasticSearchService,
    @Inject(() => MailerService)
    private readonly mailerService: MailerService,
    @Inject(() => SendyService)
    private readonly sendyService: SendyService
  ) {}

  @Authorized()
  @Query(() => MembersResponse)
  async members(
    @Args() query: MemberQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<MembersResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; members?: Promise<Member[]> } = {};

    if ('total' in fields) {
      promises.total = this.service.getMembersCount(query);
    }

    if ('members' in fields) {
      promises.members = this.service.getMembers(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; members?: Member[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized()
  @Query(() => IntroducersResponse)
  async introducers(
    @Ctx() ctx: Context,
    @Args() query: MemberQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<IntroducersResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; introducers?: Promise<Introducer[]> } = {};
    query.filter = {
      ...query.filter,
      sponsorId: ctx.user.id,
    };

    if ('total' in fields) {
      promises.total = this.service.getMembersCount(query);
    }

    if ('introducers' in fields) {
      promises.introducers = this.service.getMembers(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; introducers?: Introducer[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.Admin])
  @UseMiddleware(minerLog('create'))
  @Transaction()
  @Mutation(() => Member)
  async createMember(@Arg('data') data: CreateMemberInput): Promise<Member> {
    if (data.wallets) {
      const sumPercent = data.wallets.reduce((prev, current) => {
        if (!current.payoutId) {
          throw new Error('Not specified payout type');
        } else if (!current.address) {
          throw new Error('Not specified wallet address');
        }
        return prev + current.percent;
      }, 0);

      if (sumPercent !== 100 * PERCENT) throw new Error('Sum of percent must be 100');
    } else {
      throw new Error('No wallet data');
    }

    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
    const member = await this.service.createMember({
      ..._.omit(data, 'wallets'),
      email: data.email.toLowerCase(),
      password: hashedPassword,
      sponsorId: data.sponsorId || null,
    });

    if (data.wallets) {
      await this.memberWalletService.createManyMemberWallets({
        memberId: member.id,
        wallets: data.wallets,
      });
    } else {
      throw new Error('No wallet data');
    }

    if (data.sponsorId) {
      await this.service.incraseIntroducerCount(data.sponsorId);
      await this.service.calculateSponsorBonous(data.sponsorId);
    }

    // sendy

    if (data.syncWithSendy) {
      this.sendyService.addSubscriber(member.email, member.fullName);
    }

    return member;
  }

  @UseMiddleware(minerLog('signup'))
  @Transaction()
  @Mutation(() => Member)
  async signUpMember(@Arg('data') data: SignupFormInput): Promise<Member> {
    const hashedPassword = await hashPassword(data.password);
    let sponsorId: string | null = null;
    let sponsorName: string | null = null;
    if (data.sponsorUserId) {
      if (!Number.isInteger(+data.sponsorUserId)) {
        throw new GraphQLError('Invalid reference code', {
          extensions: {
            path: ['sponsorUserId'],
          },
        });
      }
      const member = await this.service.getMemberByUserId(+data.sponsorUserId);
      if (member && !member.status) {
        throw new GraphQLError('Reference is not approved', {
          extensions: {
            path: ['sponsorUserId'],
          },
        });
      } else if (!member) {
        throw new GraphQLError('Invalid reference code', {
          extensions: {
            path: ['sponsorUserId'],
          },
        });
      }
      sponsorId = member.id;
      sponsorName = member.fullName;
    }
    const newmember = await this.service.createMember({
      ..._.omit(data, ['packageId', 'paymentMenthod', 'sponsorUserId']),
      email: data.email.toLowerCase(),
      password: hashedPassword,
      status: false,
      signupFormRequest: data,
      emailVerified: false,
      sponsorId,
    });

    this.mailerService.notifyMinerSignupToAdmin(newmember.email, newmember.fullName, sponsorName);
    return newmember;
  }

  @Mutation(() => EmailVerificationResponse)
  async sendEmailVerification(@Arg('data') data: EmailInput): Promise<EmailVerificationResponse> {
    const { token, digit, name } =
      await this.service.generateVerificationTokenAndDigitByEmail(data);
    this.mailerService.sendEmailVerificationCode(
      data.email,
      name,
      digit,
      `${process.env.MEMBER_URL}/verify-email?email=${encodeURIComponent(data.email)}`
    );

    return {
      token,
    };
  }

  @Mutation(() => SuccessResponse)
  async emailVerify(@Arg('data') data: EmailVerificationInput): Promise<SuccessResponse> {
    const member = await this.service.verifyEmailDigit(data);

    if (member) {
      return {
        result: SuccessResult.success,
      };
    } else {
      return {
        result: SuccessResult.failed,
        message: 'Can not verify email',
      };
    }
  }

  @Authorized()
  @UseMiddleware(userPermission)
  @UseMiddleware(minerLog('update'))
  @Transaction()
  @Mutation(() => Member)
  async updateMember(@Ctx() ctx: Context, @Arg('data') data: UpdateMemberInput): Promise<Member> {
    if (data.wallets) {
      const sumPercent = data.wallets.reduce((prev, current) => {
        if (!current.payoutId) {
          throw new Error('Not specified payout type');
        } else if (!current.address) {
          throw new Error('Not specified wallet address');
        }
        return prev + current.percent;
      }, 0);
      if (sumPercent !== 100 * PERCENT) throw new Error('Sum of percent must be 100');
    }

    if (data.id === PLACEMENT_ROOT && data.placementParentId !== PLACEMENT_ROOT) {
      throw new Error('You can not change parent of root node');
    }

    let newData: UpdateMemberInput = {
      id: ctx.isAdmin ? data.id : ctx.user.id,
      ..._.omit(data, ['wallets', ctx.isAdmin ? null : 'sponsorId']),
    };
    if (data.email) newData.email = data.email.toLowerCase();
    if ('sponsorId' in newData && !newData.sponsorId) {
      newData.sponsorId = null;
    }

    const {
      sponsorId: prevSponsorID,
      email: oldEmail,
      syncWithSendy: oldSyncWithSendy,
    } = await this.service.getMemberById(newData.id);
    const member = await this.service.updateMember(newData);
    if (data.wallets) {
      await this.memberWalletService.updateManyMemberWallet({
        memberId: data.id ?? ctx.user.id,
        wallets: data.wallets,
      });
    }

    if (prevSponsorID !== member.sponsorId) {
      if (prevSponsorID) {
        await this.service.decreaseIntroducerCount(prevSponsorID);
        await this.service.calculateSponsorBonous(prevSponsorID);
      }
      if (member.sponsorId) {
        await this.service.incraseIntroducerCount(member.sponsorId);
        await this.service.calculateSponsorBonous(member.sponsorId);
      }
    }

    if (oldEmail !== member.email) {
      this.sendyService.removeSubscriber(oldEmail);

      if (member.syncWithSendy) {
        this.sendyService.addSubscriber(member.email, member.fullName);
      }
    } else if (oldEmail === member.email) {
      if (!oldSyncWithSendy && member.syncWithSendy) {
        this.sendyService.addSubscriber(member.email, member.fullName);
      } else if (oldSyncWithSendy && !member.syncWithSendy) {
        this.sendyService.removeSubscriber(member.email);
      }
    }

    return member;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async approveMember(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    const member = await this.service.updateMember({
      id: data.id,
      status: true,
    });
    if (member.sponsorId) {
      await this.service.incraseIntroducerCount(member.sponsorId);
      await this.service.calculateSponsorBonous(member.sponsorId);
    }

    // sendy
    this.sendyService.addSubscriber(member.email, member.fullName);

    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.Admin])
  @UseMiddleware(minerLog('remove'))
  @Transaction()
  @Mutation(() => SuccessResponse)
  async removeMember(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    const salesCnt = await this.saleService.getSalesCount({
      where: {
        memberId: data.id,
      },
      orderBy: [],
      parsePage: {},
    });
    const placementChildrenCount = await this.service.getMembersCount({
      where: {
        placementParentId: data.id,
      },
    });

    if (salesCnt) {
      throw new Error(`There are sales of this member`);
    }
    if (placementChildrenCount) {
      throw new Error(`There are placement children`);
    }

    await this.memberWalletService.removeMemberWalletsByMemberId(data);
    const member = await this.service.removeMember(data.id);

    // sendy
    this.sendyService.removeSubscriber(member.email);

    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async removeCompleteMemberPlacement(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    const placements = await this.service.getAllPlacementAncestorsById(data.id);
    await this.service.updateManyMember(
      { id: { in: placements.map((pmnt) => pmnt.id) } },
      { placementParentId: null, placementPosition: null }
    );
    return {
      result: SuccessResult.success,
    };
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async sales(@Root() member: Member, @Ctx() ctx: Context): Promise<Sale[]> {
    return ctx.dataLoader.get('salesForMemberLoader').load(member.id);
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async statistics(@Root() member: Member, @Ctx() ctx: Context): Promise<MemberStatistics[]> {
    return ctx.dataLoader.get('memberStatisticsForMemberLoader').load(member.id);
  }

  @FieldResolver({ nullable: true })
  async sponsor(@Root() member: Member, @Ctx() ctx: Context): Promise<Member> {
    return member.sponsorId
      ? ctx.dataLoader.get('sponsorForMemberLoader').load(member.sponsorId)
      : null;
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async introduceMembers(@Root() member: Member, @Ctx() ctx: Context): Promise<Member[]> {
    return ctx.dataLoader.get('introduceMembersForMemberLoader').load(member.id);
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async memberWallets(@Root() member: Member, @Ctx() ctx: Context): Promise<MemberWallet[]> {
    return ctx.dataLoader.get('memberWalletsForMemberLoader').load(member.id);
  }

  @FieldResolver({ nullable: true })
  async placementParent(@Root() member: Member, @Ctx() ctx: Context): Promise<Member> {
    return member.placementParentId
      ? ctx.dataLoader.get('placementParentForMemberLoader').load(member.placementParentId)
      : null;
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async placementChildren(@Root() member: Member, @Ctx() ctx: Context): Promise<Member[]> {
    return ctx.dataLoader.get('placementChildrenForMemberLoader').load(member.id);
  }

  @Authorized()
  @Query(() => Member)
  async memberMe(@Ctx() ctx: Context): Promise<Member> {
    return ctx.user! as Member;
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => Member)
  async updatePasswordMemberById(
    @Arg('data') data: UpdateMemberPasswordInputById
  ): Promise<Member> {
    const hashedPassword = await hashPassword(data.newPassword);

    return await this.service.updateMember({ id: data.id, password: hashedPassword });
  }

  @Authorized()
  @Mutation(() => SuccessResponse)
  async updatePasswordMember(
    @Ctx() ctx: Context,
    @Arg('data') data: UpdateMemberPasswordInput
  ): Promise<SuccessResponse> {
    const { password } = await this.service.getMemberById(ctx.user.id);
    const hashedPassword = await hashPassword(data.newPassword);

    const isValid = await verifyPassword(data.oldPassword, password);

    if (isValid) {
      await this.service.updateMember({ id: ctx.user.id, password: hashedPassword });
      return {
        result: SuccessResult.success,
      };
    } else {
      return {
        result: SuccessResult.failed,
      };
    }
  }

  @Mutation(() => MemberLoginResponse)
  async memberLogin(@Arg('data') data: MemberLoginInput): Promise<MemberLoginResponse> {
    const member = await this.service.getMemberByEmail(data.email.toLowerCase());

    if (!member) {
      throw new Error('Invalid credentials are provided');
    } else if (!member.emailVerified) {
      throw new Error('Your email is not verified');
    } else if (!member.status) {
      throw new Error('You are not allowed by admin');
    }

    const isValidPassword = await verifyPassword(data.password, member.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials are provided');
    }

    return {
      accessToken: createAccessToken({
        id: member.id,
        isAdmin: false,
      }),
    };
  }

  @Mutation(() => SuccessResponse)
  async resetPasswordRequest(@Arg('data') data: EmailInput): Promise<SuccessResponse> {
    const { token, email, fullName } = await this.service.generateResetTokenByEmail(data);
    if (token) {
      this.mailerService.sendForgetpasswordLink(
        email,
        fullName,
        `${process.env.MEMBER_URL}/reset-password?token=${token}`
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
  async resetPasswordByToken(@Arg('data') data: ResetPasswordTokenInput): Promise<SuccessResponse> {
    await this.service.resetPasswordByToken(data);
    return {
      result: SuccessResult.success,
    };
  }

  @Mutation(() => VerifyTokenResponse)
  async resetTokenVerify(@Arg('data') data: TokenInput): Promise<VerifyTokenResponse> {
    try {
      const member = await this.service.verifyAndUpdateToken(data);
      if (member) return member;
      else throw new Error('Invalid token');
    } catch (err) {
      throw new Error('Invalid token');
    }
  }

  @Authorized()
  @UseMiddleware(userPermission)
  @Query(() => MemberOverview)
  async memberOverview(@Arg('data') { id }: MemberOverviewInput): Promise<MemberOverview> {
    const { txcShared: totalTXCShared } = await this.memberStatisticsService.getTotalTXCShared(id);
    const currentHashPower = await this.saleService.getMemberHashPowerById({ id });
    const { createdAt: joinDate, point } = await this.service.getMemberById(id);

    return {
      currentHashPower,
      totalTXCShared: totalTXCShared ?? BigInt(0),
      joinDate,
      point,
    };
  }

  @Authorized([UserRole.Admin])
  @Query(() => CountResponse)
  async countLeftMembers(@Arg('data') data: IDInput): Promise<CountResponse> {
    const count = await this.service.getMembersCount({
      where: {
        placementParentId: data.id,
        placementPosition: 'LEFT',
      },
    });
    return {
      count,
    };
  }

  @Authorized([UserRole.Admin])
  @Query(() => CountResponse)
  async countRightMembers(@Arg('data') data: IDInput): Promise<CountResponse> {
    const count = await this.service.getMembersCount({
      where: {
        placementParentId: data.id,
        placementPosition: 'RIGHT',
      },
    });
    return {
      count,
    };
  }

  @Authorized([UserRole.Admin])
  @Query(() => PlacementPositionCountResponse)
  async countBelowMembers(@Arg('data') data: IDInput): Promise<PlacementPositionCountResponse> {
    const leftCount = await this.service.getMembersCount({
      where: {
        placementParentId: data.id,
        placementPosition: 'LEFT',
      },
    });
    const rightCount = await this.service.getMembersCount({
      where: {
        placementParentId: data.id,
        placementPosition: 'RIGHT',
      },
    });

    return {
      leftCount,
      rightCount,
    };
  }

  @FieldResolver(() => [MemberLog])
  async logs(@Root() member: Member, @Arg('logsize', { defaultValue: 10 }) logsize: number) {
    const logres = await this.elasticService.getLogByMinerUsername(member.id, logsize);

    return logres
      ? logres.hits.hits.map((hit) => ({
          id: hit._id,
          ...(hit._source as object),
        }))
      : [];
  }

  @Authorized()
  @Query(() => ReferenceLink)
  generateReferenceLink(@Ctx() ctx: Context): ReferenceLink {
    return {
      link: `${process.env.MEMBER_URL}/sign-up?reference=${ctx.isAdmin ? ctx.user.username : (ctx.user as Member).userId}`,
    };
  }

  // @FieldResolver(() => [WeeklyCommission])
  // async weeklyCommissions(
  //   @Root() member: Member,
  //   @Ctx() ctx: Context
  // ): Promise<WeeklyCommission[]> {
  //   return ctx.dataLoader.get('weeklyCommissionsForMemberLoader').load(member.id);
  // }
}
