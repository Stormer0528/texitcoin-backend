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
  Int,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';

import { DEFAULT_PASSWORD, PLACEMENT_ROOT, SPONSOR_BONOUS_CNT } from '@/consts';
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
  ResetPasswordTokenInput,
  SuccessResponse,
  TokenInput,
  VerifyTokenResponse,
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
  MemberOverview,
  PlacementPositionCountResponse,
  MemberLog,
  ReferenceLink,
  SignupFormInput,
  EmailVerificationResponse,
  EmailVerificationInput,
  IntroducersResponse,
  Introducer,
  EmailVerifyResult,
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
import { AdminNotes } from '../adminNotes/adminNotes.entity';
import { MemberState, PlacementPosition, SuccessResult } from '@/graphql/enum';
import { PackageService } from '../package/package.service';
import { QueryOrderPagination } from '@/graphql/queryArgs';
import { PrismaService } from '@/service/prisma';
import { getDynamicOrderBy } from '@/utils/getDynamicOrderBy';
import { CommissionStatus } from '../weeklycommission/weeklycommission.type';
import { WeeklyCommissionService } from '../weeklycommission/weeklycommission.service';
import { Balance } from '../balance/balance.entity';
import { TelegramBotService } from '@/service/tgbot';

@Service()
@Resolver(() => Member)
export class MemberResolver {
  constructor(
    private readonly service: MemberService,
    private readonly memberWalletService: MemberWalletService,
    private readonly memberStatisticsService: MemberStatisticsService,
    private readonly saleService: SaleService,
    private readonly packageService: PackageService,
    private readonly commissionService: WeeklyCommissionService,
    @Inject(() => ElasticSearchService)
    private readonly elasticService: ElasticSearchService,
    @Inject(() => MailerService)
    private readonly mailerService: MailerService,
    @Inject(() => SendyService)
    private readonly sendyService: SendyService,
    @Inject(() => TelegramBotService)
    private readonly telegramBotService: TelegramBotService,
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  // @Authorized()
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

  @Authorized([UserRole.ADMIN])
  @Query(() => MembersResponse)
  async onepointAwayMembers(
    @Args() query: QueryOrderPagination,
    @Info() info: GraphQLResolveInfo
  ): Promise<MembersResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; members?: Promise<Member[]> } = {};

    if ('total' in fields) {
      promises.total = this.prisma.$queryRaw`
        SELECT COUNT('*')::Int
        FROM members
        WHERE "totalIntroducers" % ${SPONSOR_BONOUS_CNT} = ${SPONSOR_BONOUS_CNT - 1}
      `.then((res) => res[0]?.count);
    }

    if ('members' in fields) {
      promises.members = this.prisma.$queryRaw`
        SELECT *
        FROM members
        WHERE "totalIntroducers" % ${SPONSOR_BONOUS_CNT} = ${SPONSOR_BONOUS_CNT - 1}
        ORDER BY ${getDynamicOrderBy(query.orderBy)}
        LIMIT ${query.parsePage.take}
        OFFSET ${query.parsePage.skip}
    `;
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; members?: Member[] } = {};

    for (let [key, value] of result) {
      response[key] = await value;
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

  @Authorized([UserRole.ADMIN])
  @UseMiddleware(minerLog('create'))
  @Transaction()
  @Mutation(() => Member)
  async createMember(@Arg('data') data: CreateMemberInput): Promise<Member> {
    this.memberWalletService.validateMemberWallets(data.wallets);

    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
    const member = await this.service.createMember({
      ..._.omit(data, 'wallets'),
      password: hashedPassword,
      sponsorId: data.sponsorId || null,
      allowState: MemberState.APPROVED,
      status: true,
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
      await this.service.checkSponsorBonous(data.sponsorId);
    }

    // sendy

    if (data.syncWithSendy) {
      this.sendyService.addSubscriber(member.email, member.fullName, member.state);
    }

    // Automatic replace placement tree
    if (member.sponsorId) {
      await this.service.moveToBottomOfTree(member.sponsorId, member.id);
    }

    return member;
  }

  @Authorized([UserRole.ADMIN])
  @UseMiddleware(minerLog('create'))
  @Transaction()
  @Mutation(() => Member)
  async duplicateMember(@Arg('data') data: IDInput): Promise<Member> {
    const member = await this.service.getMemberById(data.id);
    const splitEmails = member.email.split('@');
    const emails = await this.prisma.member
      .findMany({
        where: {
          email: {
            startsWith: splitEmails[0],
          },
        },
        select: {
          email: true,
        },
      })
      .then((members) => members.map((mbr) => mbr.email));
    const usernames = await this.prisma.member
      .findMany({
        where: {
          username: {
            startsWith: member.username,
          },
        },
        select: {
          username: true,
        },
      })
      .then((members) => members.map((mbr) => mbr.username));

    let i = 1;
    while (true) {
      const idx = usernames.findIndex((usn) => usn === `${member.username}+${i}`);
      if (idx === -1) break;
      i++;
    }
    const username = `${member.username}+${i}`;

    i = 1;
    while (true) {
      const idx = emails.findIndex((email) => email === `${splitEmails[0]}+${i}@${splitEmails[1]}`);
      if (idx === -1) break;
      i++;
    }
    const email = `${splitEmails[0]}+${i}@${splitEmails[1]}`;

    return this.service.createMember({
      assetId: '',
      email,
      fullName: member.fullName,
      mobile: member.mobile,
      password: member.password,
      primaryAddress: member.primaryAddress,
      sponsorId: member.sponsorId,
      username,
      allowState: 'PENDING',
      city: member.city,
      country: member.country,
      ID: null,
      preferredContact: member.preferredContact,
      preferredContactDetail: member.preferredContactDetail,
      promoCode: member.promoCode,
      secondaryAddress: member.secondaryAddress,
      state: member.state,
      status: false,
      syncWithSendy: false,
      teamReport: member.teamReport,
      teamStrategy: member.teamStrategy,
      zipCode: member.zipCode,
      signupFormRequest: null,
    });
  }

  @UseMiddleware(minerLog('signup'))
  @Transaction()
  @Mutation(() => Member)
  async signUpMember(@Arg('data') data: SignupFormInput): Promise<Member> {
    const hashedPassword = await hashPassword(data.password);
    let sponsorId: string | null = null;
    let sponsorName: string | null = data.sponsorUserId;
    if (data.sponsorUserId) {
      const member = await this.service.getMemberByUsername(data.sponsorUserId);
      if (member?.status) {
        sponsorId = member.id;
        sponsorName = member.fullName;
      }
    }
    let requestPkg = null;
    if (data.packageId) requestPkg = await this.packageService.getPackageById(data.packageId);
    const newMember = await this.service.createMember({
      ..._.omit(data, ['packageId', 'paymentMethod', 'sponsorUserId']),
      password: hashedPassword,
      status: false,
      signupFormRequest: {
        ..._.omit(data, 'password'),
        package: requestPkg?.productName,
      },
      emailVerified: false,
      sponsorId,
      ID: null,
      allowState: MemberState.PENDING,
    });

    this.mailerService.notifyMinerSignupToAdmin(newMember.email, newMember.fullName, sponsorName);
    this.telegramBotService.sendNewMinerSignUpNotification(
      newMember.username,
      newMember.fullName,
      newMember.email,
      newMember.mobile,
      requestPkg?.productName ?? 'No package',
      data.paymentMethod,
      sponsorName ?? 'No sponsor',
      data.promoCode ?? 'No promo',
      newMember.assetId
    );

    return newMember;
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

  @Mutation(() => EmailVerifyResult)
  async emailVerify(@Arg('data') data: EmailVerificationInput): Promise<EmailVerifyResult> {
    const member = await this.service.verifyEmailDigit(data);

    if (member) {
      const { signupFormRequest }: { signupFormRequest: any } = member;

      // Send Email
      this.mailerService.sendToSignUpConfirmation(member.email, member.fullName);

      return {
        result: SuccessResult.success,
        packageId: signupFormRequest?.packageId,
        paymentMethod: signupFormRequest?.paymentMethod,
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
    this.memberWalletService.validateMemberWallets(data.wallets, true);

    if (
      data.id === PLACEMENT_ROOT &&
      'placementParentId' in data &&
      data.placementParentId !== PLACEMENT_ROOT
    ) {
      throw new Error('You can not change parent of root node');
    }

    const weeklyCommissions = await this.commissionService.getWeeklyCommissionsByMemberId(data.id);

    if ((data.placementParentId || data.placementPosition) && weeklyCommissions.length) {
      throw new Error(
        'You cannot modify the placement tree data because the commission has already been calculated'
      );
    }

    let newData: UpdateMemberInput = {
      id: ctx.isAdmin ? data.id : ctx.user.id,
      ..._.omit(data, ['wallets', ...(ctx.isAdmin ? [] : ['sponsorId', 'ID', 'assetId'])]),
    };
    if ('sponsorId' in newData && !newData.sponsorId) {
      newData.sponsorId = null;
    }

    const {
      sponsorId: prevSponsorID,
      email: oldEmail,
      syncWithSendy: oldSyncWithSendy,
      placementPath: oldPlacementPath,
    } = await this.service.getMemberById(newData.id);
    const member = await this.service.updateMember(newData);
    if (data.wallets) {
      await this.memberWalletService.updateManyMemberWallet({
        memberId: data.id ?? ctx.user.id,
        wallets: data.wallets,
      });
    }

    if (member.placementParentId) {
      const children = await this.service.getPlacementChildren(member.placementParentId);

      if (
        children.filter((child) => child.placementPosition === 'LEFT').length > 1 ||
        children.filter((child) => child.placementPosition === 'RIGHT').length > 1
      ) {
        throw new GraphQLError('Each member can have only one leg on each side.', {
          extensions: {
            path: ['placementParentId', 'placementPosition'],
          },
        });
      }

      const { placementPath: parentPlacementPath } = await this.service.getMemberById(
        member.placementParentId
      );

      const newPath = `${parentPlacementPath}/${member.ID}`;

      if (oldPlacementPath !== newPath) {
        if (oldPlacementPath) {
          await this.prisma.$queryRaw`
        UPDATE members
        SET "placementPath" = REPLACE("placementPath", ${oldPlacementPath}, ${newPath})
        WHERE "placementPath" = ${oldPlacementPath} OR "placementPath" LIKE ${oldPlacementPath + '/%'}
      `;
        } else {
          await this.prisma.member.update({
            where: {
              id: member.id,
            },
            data: {
              placementPath: newPath,
            },
          });
        }
      }
    }

    if (prevSponsorID !== member.sponsorId) {
      if (prevSponsorID) {
        await this.service.checkSponsorBonous(prevSponsorID);
      }
      if (member.sponsorId) {
        await this.service.checkSponsorBonous(member.sponsorId);
      }
    }

    if (oldEmail !== member.email) {
      this.sendyService.removeSubscriber(oldEmail);

      if (member.syncWithSendy) {
        this.sendyService.addSubscriber(member.email, member.fullName, member.state);
      }
    } else if (oldEmail === member.email) {
      if (!oldSyncWithSendy && member.syncWithSendy) {
        this.sendyService.addSubscriber(member.email, member.fullName, member.state);
      } else if (oldSyncWithSendy && !member.syncWithSendy) {
        this.sendyService.removeSubscriber(member.email);
      }
    }

    return member;
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async verifyMemberEmail(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.service.updateMember({
      id: data.id,
      emailVerified: true,
    });

    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async approveMember(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    const member = await this.service.approveMember(data.id);

    // Automatic replace placement tree
    if (member.sponsorId) {
      await this.service.moveToBottomOfTree(member.sponsorId, member.id);
    }

    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async moveToGraveyard(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.service.updateMember({
      id: data.id,
      allowState: MemberState.GRAVEYARD,
      status: false,
    });

    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async moveToPaid(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.service.updateMember({
      id: data.id,
      allowState: MemberState.PAID,
      status: false,
    });

    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async moveToPending(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.service.updateMember({
      id: data.id,
      allowState: MemberState.PENDING,
      status: false,
    });

    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.ADMIN])
  @UseMiddleware(minerLog('remove'))
  @Transaction()
  @Mutation(() => SuccessResponse)
  async removeMember(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    const salesCnt = await this.saleService.getSalesCount({
      where: {
        memberId: data.id,
      },
    });
    const placementChildrenCount = await this.service.getMembersCount({
      where: {
        placementParentId: data.id,
      },
    });
    const commissionCnt = await this.commissionService.getWeeklyCommissionsCount({
      where: {
        memberId: data.id,
        status: {
          not: 'PREVIEW',
        },
        commission: {
          gt: 0,
        },
      },
    });

    if (salesCnt) {
      throw new Error(`There are sales of this member`);
    }
    if (placementChildrenCount) {
      throw new Error(`There are placement children`);
    }
    if (commissionCnt) {
      throw new Error('There are commissions the miner received');
    }

    await this.commissionService.removeWeeklyCommissions({
      where: {
        OR: [
          {
            status: 'PREVIEW',
          },
          {
            commission: 0,
          },
        ],
        memberId: data.id,
      },
    });
    await this.memberWalletService.removeMemberWalletsByMemberId(data);
    const member = await this.service.removeMember(data.id);

    if (member.sponsorId) {
      await this.service.checkSponsorBonous(member.sponsorId);
    }

    // sendy
    this.sendyService.removeSubscriber(member.email);

    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async removeCompleteMemberPlacement(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    const placements = await this.service.getAllPlacementAncestorsById(data.id);
    await this.service.updateManyMember(
      { id: { in: placements.map((pmnt) => pmnt.id) } },
      { placementParentId: null, placementPosition: PlacementPosition.NONE, placementPath: '' }
    );
    return {
      result: SuccessResult.success,
    };
  }

  @FieldResolver({ nullable: true })
  async sales(@Root() member: Member, @Ctx() ctx: Context): Promise<Sale[]> {
    return ctx.dataLoader.get('salesForMemberLoader').load(member.id);
  }

  @FieldResolver({ nullable: true })
  async statistics(@Root() member: Member, @Ctx() ctx: Context): Promise<MemberStatistics[]> {
    return ctx.dataLoader.get('memberStatisticsForMemberLoader').load(member.id);
  }

  @FieldResolver({ nullable: true })
  async sponsor(@Root() member: Member, @Ctx() ctx: Context): Promise<Member> {
    return member.sponsorId
      ? ctx.dataLoader.get('sponsorForMemberLoader').load(member.sponsorId)
      : null;
  }

  @FieldResolver({ nullable: true })
  async introduceMembers(@Root() member: Member, @Ctx() ctx: Context): Promise<Member[]> {
    return ctx.dataLoader.get('introduceMembersForMemberLoader').load(member.id);
  }

  @FieldResolver({ nullable: true })
  async memberWallets(@Root() member: Member, @Ctx() ctx: Context): Promise<MemberWallet[]> {
    return ctx.dataLoader.get('memberWalletsForMemberLoader').load(member.id);
  }

  @FieldResolver({ nullable: true })
  async placementParent(@Root() member: Member, @Ctx() ctx: Context): Promise<Member> {
    return member.placementParentId
      ? ctx.dataLoader.get('placementParentForMemberLoader').load(member.placementParentId)
      : null;
  }

  @FieldResolver({ nullable: true })
  async placementChildren(@Root() member: Member, @Ctx() ctx: Context): Promise<Member[]> {
    return ctx.dataLoader.get('placementChildrenForMemberLoader').load(member.id);
  }

  @Authorized([UserRole.MEMBER])
  @Query(() => Member)
  async memberMe(@Ctx() ctx: Context): Promise<Member> {
    return ctx.user! as Member;
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => Member)
  async updatePasswordMemberById(
    @Arg('data') data: UpdateMemberPasswordInputById
  ): Promise<Member> {
    const hashedPassword = await hashPassword(data.newPassword);

    return await this.service.updateMember({ id: data.id, password: hashedPassword });
  }

  @Authorized([UserRole.MEMBER])
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
    const member = await this.service.getMemberByEmail(data.email);

    if (!member) {
      throw new Error('Invalid credentials are provided');
    } else if (!member.emailVerified) {
      throw new Error('Your email is not verified');
    } else if (!member.status) {
      throw new Error(
        'You are not allowed by admin. Admin will reach out to you shortly to collect the necessary payment.'
      );
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
      this.mailerService.sendForgetPasswordLink(
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
    return this.service.verifyAndUpdateToken(data);
  }

  @Authorized()
  @UseMiddleware(userPermission)
  @Query(() => MemberOverview)
  async memberOverview(@Ctx() ctx: Context, @Arg('data') { id }: IDInput): Promise<MemberOverview> {
    const rID = ctx.isAdmin ? id : ctx.user.id;

    const { txcShared: totalTXCShared } = await this.memberStatisticsService.getTotalTXCShared(rID);
    const currentHashPower = await this.saleService.getMemberHashPowerById({ id: rID });
    const { createdAt: joinDate, point } = await this.service.getMemberById(rID);

    return {
      currentHashPower,
      totalTXCShared: totalTXCShared ?? BigInt(0),
      joinDate,
      point,
      cashCommissionPotential: await ctx.dataLoader
        .get('cashCommissionPotentialForMemberLoader')
        .load(rID),
    };
  }

  @Authorized([UserRole.ADMIN])
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

  @Authorized([UserRole.ADMIN])
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

  @Authorized([UserRole.ADMIN])
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

  @Authorized([UserRole.MEMBER])
  @Query(() => [Member])
  async teamMembers(@Ctx() ctx: Context): Promise<Member[]> {
    return this.service.getAllPlacementAncestorsById(ctx.user.id);
  }

  @FieldResolver(() => [MemberLog])
  async logs(@Root() member: Member, @Arg('logsize', { defaultValue: 10 }) logsize: number) {
    const logRes = await this.elasticService.getLogByMinerId(member.id, logsize);

    return logRes
      ? logRes.hits.hits.map((hit) => ({
          id: hit._id,
          ...(hit._source as object),
        }))
      : [];
  }

  @Authorized([UserRole.MEMBER])
  @Query(() => ReferenceLink)
  generateReferenceLink(@Ctx() ctx: Context): ReferenceLink {
    return {
      link: `${process.env.MEMBER_URL}/sign-up?sponsor=${(ctx.user as Member).username}`,
    };
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => SuccessResponse)
  async sendWelcomeEmail(@Arg('data') data: EmailInput): Promise<SuccessResponse> {
    const member = await this.service.getMemberByEmail(data.email);
    if (!member) {
      throw new GraphQLError('No miner associated with the provided email address', {
        extensions: {
          path: ['email'],
        },
      });
    }

    await this.mailerService.sendWelcomeEmail(data.email);
    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.ADMIN])
  @FieldResolver(() => [AdminNotes])
  async adminNotes(@Root() member: Member, @Ctx() ctx: Context) {
    return ctx.dataLoader.get('adminNotesForMemberLoader').load(member.id);
  }

  @FieldResolver(() => [WeeklyCommission])
  async weeklyCommissions(
    @Root() member: Member,
    @Ctx() ctx: Context
  ): Promise<WeeklyCommission[]> {
    return ctx.dataLoader.get('weeklyCommissionsForMemberLoader').load(member.id);
  }

  @FieldResolver(() => CommissionStatus, { nullable: true })
  async commission(@Root() member: Member, @Ctx() ctx: Context): Promise<CommissionStatus> {
    return ctx.dataLoader.get('commissionStatusForMemberLoader').load(member.id);
  }

  @FieldResolver(() => Int)
  async cmnCalculatedWeeks(@Root() member: Member, @Ctx() ctx: Context): Promise<number> {
    return ctx.dataLoader.get('commissionCountForMemberLoader').load(member.id);
  }

  @FieldResolver()
  async groupName(@Root() member: Member, @Ctx() ctx: Context): Promise<string> {
    return ctx.dataLoader.get('groupNameForMemberLoader').load(member.id);
  }

  @FieldResolver(() => [Balance], { nullable: true })
  async balances(@Root() member: Member, @Ctx() ctx: Context): Promise<Balance[]> {
    return ctx.dataLoader.get('balancesForMemberLoader').load(member.id);
  }

  @FieldResolver()
  async balance(@Root() member: Member, @Ctx() ctx: Context): Promise<number> {
    return ctx.dataLoader.get('balanceForMemberLoader').load(member.id);
  }
}
