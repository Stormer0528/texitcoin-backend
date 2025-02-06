import { PlacementPosition, Prisma } from '@prisma/client';
import { Service, Inject } from 'typedi';

import {
  EmailInput,
  ResetPasswordTokenInput,
  TokenInput,
  VerifyTokenResponse,
} from '@/graphql/common.type';
import {
  createVerificationToken,
  generateRandomString,
  hashPassword,
  verifyToken,
} from '@/utils/auth';
import { PrismaService } from '@/service/prisma';

import {
  CreateMemberInput,
  UpdateMemberInput,
  MemberQueryArgs,
  EmailVerificationInput,
  TEAM_STRATEGY,
  MEMBER_STATE,
} from './member.type';
import { Member } from './member.entity';
import { SendyService } from '@/service/sendy';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import { NO_PRODUCT, SPONSOR_BONOUS_CNT, SPONSOR_ROLL_DURATION } from '@/consts';
import { MailerService } from '@/service/mailer';
import { NotificationService } from '../notification/notification.service';
import { FrontActionEnum, MemberState, NotificationLevel } from '@/graphql/enum';
import { GroupSettingService } from '../groupSetting/groupSetting.service';
import { FrontActionService } from '@/service/frontaction';

dayjs.extend(utcPlugin);

@Service()
export class MemberService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly groupSettingService: GroupSettingService,
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService,
    @Inject(() => SendyService)
    private readonly sendyService: SendyService,
    @Inject(() => MailerService)
    private readonly mailerService: MailerService,
    @Inject(() => FrontActionService)
    private readonly frontActionService: FrontActionService
  ) {}

  async getMembers(params: MemberQueryArgs) {
    return this.prisma.member.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getMembersCount(params: Pick<MemberQueryArgs, 'where'>): Promise<number> {
    return this.prisma.member.count({ where: params.where });
  }

  async getMembersCountByDate(range: { start: Date; end: Date }) {
    return await this.prisma.$queryRaw<{ date: Date; count: number }[]>`
      SELECT 
        DATE("createdAt") as date, 
        CAST(COUNT("ID") as INT) as count
      FROM 
        Members
      WHERE 
        "createdAt" BETWEEN ${range.start} AND ${range.end}
      GROUP BY 
        DATE("createdAt")
      ORDER BY
        date ASC`;
  }

  async getMemberById(id: string) {
    return this.prisma.member.findUnique({
      where: {
        id,
      },
    });
  }

  async getIntroducers(id: string) {
    return this.prisma.member.findMany({
      where: {
        sponsorId: id,
      },
    });
  }

  async getAllPlacementAncestorsById(id: string) {
    const parent = await this.prisma.member.findUnique({ where: { id } });
    return this.prisma.member.findMany({
      where: {
        OR: [
          {
            placementPath: parent.placementPath,
          },
          {
            placementPath: {
              startsWith: parent.placementPath + '/',
            },
          },
        ],
      },
    });
  }

  async getMemberByUsername(username: string) {
    return this.prisma.member.findUnique({
      where: {
        username,
      },
    });
  }

  async getMemberByID(ID: number) {
    return this.prisma.member.findUnique({
      where: {
        ID,
      },
    });
  }

  async getPlacementChildren(id: string) {
    return this.prisma.member.findMany({
      where: {
        placementParentId: id,
      },
    });
  }

  async createMember(
    data: CreateMemberInput & {
      password: string;
      signupFormRequest: any;
      sponsorId?: string;
      ID?: number | null;
      status?: boolean;
      allowState?: MEMBER_STATE;
    }
  ) {
    const maxID = await this.getMaxID();
    return this.prisma.member.create({
      data: {
        ...data,
        ID: 'ID' in data ? data.ID : maxID + 1,
      },
    });
  }

  async updateMember({
    id,
    ...data
  }: UpdateMemberInput & {
    password?: string;
    status?: boolean;
    allowState?: MemberState;
    emailVerified?: boolean;
  }) {
    return this.prisma.member.update({
      where: { id },
      data,
    });
  }

  async updateManyMember(
    where: Prisma.MemberWhereInput,
    data: Omit<UpdateMemberInput, 'id'> & { id?: string; placementPath?: string }
  ) {
    return this.prisma.member.updateMany({
      where,
      data,
    });
  }

  async getMemberByEmail(email: string) {
    return this.prisma.member.findFirst({
      where: {
        email,
      },
    });
  }

  async removeMember(id: string) {
    return this.prisma.member.delete({
      where: {
        id,
      },
    });
  }

  async generateResetTokenByEmail(data: EmailInput) {
    const randomLength = Math.floor(Math.random() * 60) + 40;
    const token = createVerificationToken(generateRandomString(randomLength));
    const member = await this.prisma.member.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!member) {
      throw new Error('Can not find email');
    } else if (member.emailVerified) {
      return this.prisma.member.update({
        where: {
          email: data.email,
        },
        data: {
          token,
        },
      });
    } else {
      throw new Error('Email is not verified');
    }
  }

  async resetPasswordByToken(data: ResetPasswordTokenInput) {
    const hashedPassword = await hashPassword(data.password);
    return this.prisma.member.update({
      where: {
        token: data.token,
      },
      data: {
        password: hashedPassword,
        token: null,
      },
    });
  }

  async verifyAndUpdateToken(data: TokenInput): Promise<VerifyTokenResponse> {
    try {
      const { verification } = verifyToken(data.token) as any;
      if (!verification) {
        throw new Error('Invalid Token');
      }

      const randomLength = Math.floor(Math.random() * 60) + 40;

      const member = await this.prisma.member.findUnique({
        where: {
          token: data.token,
        },
      });

      if (!member) {
        throw new Error('Invalid Token');
      }

      return this.prisma.member.update({
        where: {
          token: data.token,
        },
        data: {
          token: generateRandomString(randomLength),
        },
        select: {
          email: true,
          token: true,
        },
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new Error('Token is expired');
      } else {
        throw err;
      }
    }
  }

  async updateMemberPointByMemberId(id: string): Promise<void> {
    const sales = await this.prisma.sale.findMany({
      where: {
        memberId: id,
        status: true,
      },
      include: {
        package: true,
      },
    });

    const {
      point: prevPoint,
      sponsorId,
      username,
      fullName,
    } = await this.prisma.member.findUnique({
      where: { id },
      select: {
        point: true,
        sponsorId: true,
        username: true,
        fullName: true,
      },
    });

    const newPoint = sales.reduce((prev, cur) => prev + cur.package.point, 0);
    await this.prisma.member.update({
      where: {
        id,
      },
      data: {
        point: newPoint,
      },
    });

    if (newPoint - prevPoint) {
      await this.notificationService.addNotification(
        `${fullName}(${username}) earned a total of ${newPoint} points, with ${newPoint - prevPoint} points added recently.`,
        NotificationLevel.TEAMLEADER,
        sponsorId ? [sponsorId] : []
      );
    }
  }

  async generateVerificationTokenAndDigitByEmail(data: EmailInput) {
    const randomDigit = `${Math.floor(Math.random() * 899999) + 100000}`;
    const token = createVerificationToken(randomDigit);

    const member = await this.prisma.member.update({
      where: {
        email: data.email,
      },
      data: {
        token,
      },
    });
    return {
      token,
      digit: randomDigit,
      name: member.fullName,
    };
  }

  async verifyEmailDigit(data: EmailVerificationInput) {
    try {
      const { verification } = verifyToken(data.token) as any;
      if (!verification) {
        throw new Error('Invalid Token');
      }
      if (verification !== data.digit) {
        throw new Error('Invalid Code');
      }

      return this.prisma.member.update({
        where: {
          token: data.token,
          email: data.email,
        },
        data: {
          token: null,
          emailVerified: true,
        },
        select: {
          email: true,
          fullName: true,
          signupFormRequest: true,
        },
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new Error('Token is expired');
      } else {
        throw err;
      }
    }
  }

  private async handle12FreeBonus(member: Member) {
    const group = await this.groupSettingService.getGroup(member.createdAt);

    let packageId = null;
    const nowDate = dayjs(new Date(), { utc: true });
    const lastRolledSponsor = dayjs(member.lastRolledSponsor, { utc: true });
    const isWithinSponsorRollDuration =
      nowDate.diff(lastRolledSponsor, 'day') <= SPONSOR_ROLL_DURATION;

    if (isWithinSponsorRollDuration) {
      packageId = group?.rollSponsorBonusPackageId || group?.sponsorBonusPackageId;

      if (group?.rollSponsorBonusPackageId) {
        await this.prisma.member.update({
          where: {
            id: member.id,
          },
          data: {
            lastRolledSponsor: dayjs(new Date(), { utc: true }).toDate(),
          },
        });
      }
    } else {
      packageId = group?.sponsorBonusPackageId;
    }

    if (packageId) {
      this.frontActionService.addAction({
        action: FrontActionEnum.CREATE12FREEBONUSSALE,
        message: `Do you want to create a 1-2-free bonus(${isWithinSponsorRollDuration ? 'Normal' : 'Fast'}) sale?`,
        extra: {
          memberId: member.id,
          packageId,
          paymentMethod: 'BONUS',
          sponsorCnt: member.totalIntroducers,
          isWithinSponsorRollDuration,
        },
      });

      this.mailerService.notifyMiner3rdIntroducersToAdmin(
        member.username,
        member.fullName,
        member.totalIntroducers,
        isWithinSponsorRollDuration ? 'Normal' : 'Fast',
        group?.name
      );
    } else {
      this.mailerService.notifyMiner3rdIntroducersToAdmin(
        member.username,
        member.fullName,
        member.totalIntroducers,
        isWithinSponsorRollDuration ? 'Normal' : 'Fast',
        group?.name
      );
    }
  }
  async checkSponsorBonous(id: string, isNew: boolean = true): Promise<void> {
    if (!id) return;

    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) return;

    const is12FreeBonus =
      member.totalIntroducers && member.totalIntroducers % SPONSOR_BONOUS_CNT === 0;
    const isFirstSponsor = member.totalIntroducers % SPONSOR_BONOUS_CNT === 1;
    const is1PointAway = member.totalIntroducers % SPONSOR_BONOUS_CNT === SPONSOR_BONOUS_CNT - 1;

    if (is12FreeBonus && isNew) {
      await this.handle12FreeBonus(member);
    } else if (isFirstSponsor && isNew) {
      // notification system
      await this.notificationService.addNotification(
        `${member.fullName}(${member.username}) achieved first sponsor`,
        NotificationLevel.TEAMLEADER,
        member.sponsorId ? [member.sponsorId] : []
      );
    } else if (is1PointAway && !isNew) {
      const freeSales = await this.prisma.sale.findFirst({
        where: {
          memberId: id,
          sponsorCnt: {
            gt: 0,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          statisticsSales: {
            select: {
              id: true,
            },
          },
          package: {
            select: {
              productName: true,
            },
          },
        },
      });

      if (freeSales) {
        if (freeSales.statisticsSales.length) {
          this.frontActionService.addAction({
            action: FrontActionEnum.UPDATE12FREEBONUSSALE,
            message: `Do you want to update a 1-2-free bonus sale?`,
            extra: {
              id: freeSales.id,
              ID: freeSales.ID,
              oldPackageId: freeSales.packageId,
              oldProductName: freeSales.package.productName,
              newPackageId: NO_PRODUCT,
              newProductName: 'No Product',
              status: false,
            },
          });
        } else {
          this.frontActionService.addAction({
            action: FrontActionEnum.REMOVE12FREEBONUSSALE,
            message: `Do you want to remove a 1-2-free bonus sale?`,
            extra: {
              id: freeSales.id,
              ID: freeSales.ID,
            },
          });
        }
      }
    } else if (is1PointAway && isNew) {
      await this.notificationService.addNotification(
        `${member.fullName}(${member.username}) is 1 point away from a 1-2-free bonus`,
        NotificationLevel.TEAMLEADER,
        member.sponsorId ? [member.sponsorId] : []
      );
    }
  }

  async calculateTotalIntroducerCount(id: string): Promise<void> {
    const introducers = await this.prisma.member.count({
      where: {
        sponsorId: id,
        status: true,
      },
    });
    await this.prisma.member.update({
      where: {
        id,
      },
      data: {
        totalIntroducers: introducers,
      },
    });
  }

  async approveMember(id: string) {
    const prevMember = await this.prisma.member.findUnique({
      where: {
        id,
      },
    });

    if (prevMember.status) {
      return;
    }

    const member = await this.prisma.member.update({
      where: {
        id,
      },
      data: {
        status: true,
        ...(prevMember.ID ? {} : { ID: (await this.getMaxID()) + 1 }),
        allowState: MemberState.APPROVED,
      },
    });

    if (member.sponsorId) {
      await this.calculateTotalIntroducerCount(member.sponsorId);
      await this.checkSponsorBonous(member.sponsorId);
    }

    if (member.syncWithSendy) {
      // sendy
      this.sendyService.addSubscriber(member.email, member.fullName, member.state);
    }

    return member;
  }

  async getMaxID(): Promise<number> {
    const { ID: maxID } = await this.prisma.member.findFirst({
      where: {
        ID: {
          not: null,
        },
      },
      orderBy: {
        ID: 'desc',
      },
    });

    return maxID;
  }

  async getBottomOfTree(
    id: string,
    direction: Omit<PlacementPosition, 'NONE'>
  ): Promise<[string, string | null]> {
    const members = await this.prisma.member.findMany({
      select: {
        id: true,
        placementParentId: true,
        placementPosition: true,
        placementPath: true,
      },
    });

    let res: [string, string | null] = [id, members.find((mb) => mb.id === id).placementPath];
    while (true) {
      const children = members.find(
        (mb) => mb.placementParentId === res[0] && mb.placementPosition === direction
      );
      if (children) {
        res = [children.id, children.placementPath];
      } else {
        break;
      }
    }

    return res;
  }

  async moveToBottomOfTree(parentID: string, targetID: string) {
    const parentMember = await this.prisma.member.findUnique({
      where: {
        id: parentID,
      },
    });
    const targetMember = await this.prisma.member.findUnique({
      where: {
        id: targetID,
      },
    });

    if (parentMember.placementParentId && parentMember.placementPosition != 'NONE') {
      let targetDirection: TEAM_STRATEGY = parentMember.teamStrategy;
      if (!(targetDirection === 'LEFT' || targetDirection === 'RIGHT')) {
        return;
      }

      const [bottomID, bottomPath] = await this.getBottomOfTree(parentID, targetDirection);
      await this.prisma.member.update({
        where: {
          id: targetID,
        },
        data: {
          placementParentId: bottomID,
          placementPosition: targetDirection,
          placementPath: `${bottomPath}/${targetMember.ID}`,
        },
      });
    }
  }

  async updateBalanceByMemberId(id: string) {
    const balance = await this.prisma.$queryRaw<{ balance: number }[]>`
      SELECT COALESCE(SUM("amountInCents"), 0)::Int as balance
      FROM balances
      WHERE "memberId" = ${id}
    `.then((res) => res[0].balance);
    await this.prisma.member.update({
      where: {
        id,
      },
      data: {
        balanceInCents: balance,
      },
    });
  }

  async updateBalanceByMemberIds(ids: string[]) {
    await this.prisma.$queryRaw`
      UPDATE members
      SET "balanceInCents" = balances.balance
      FROM (
        SELECT "memberId", COALESCE(SUM("amountInCents"), 0)::Int as balance
        FROM balances
        WHERE "memberId" in (${Prisma.join(ids)})
        GROUP BY "memberId"
      ) as balances
      WHERE members.id = balances."memberId"
    `;
  }
}
