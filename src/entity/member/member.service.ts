import { Prisma } from '@prisma/client';
import { Service, Inject } from 'typedi';

import { EmailInput, TokenInput } from '@/graphql/common.type';
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
  ResetPasswordTokenInput,
  VerifyTokenResponse,
  EmailVerificationInput,
} from './member.type';
import { Member } from './member.entity';
import { SendyService } from '@/service/sendy';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import { addPoint } from '@/utils/addPoint';
import { formatDate } from '@/utils/common';
import Bluebird from 'bluebird';

dayjs.extend(utcPlugin);

@Service()
export class MemberService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService,
    @Inject(() => SendyService)
    private readonly sendyService: SendyService
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
        CAST(COUNT("userId") as INT) as count
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

  async getAllPlacementAncestorsById(id: string) {
    const res: Member[] = [await this.prisma.member.findUnique({ where: { id } })];
    let previousIDs: string[] = [id];
    while (true) {
      const children = await this.prisma.member.findMany({
        where: {
          placementParentId: {
            in: previousIDs,
          },
        },
      });
      if (!children.length) break;
      res.push(...children);
      previousIDs = children.map((child) => child.id);
    }
    return res;
  }

  async getMemberByUsername(username: string) {
    return this.prisma.member.findUnique({
      where: {
        username,
      },
    });
  }

  async getMemberByUserId(userId: number) {
    return this.prisma.member.findUnique({
      where: {
        userId,
      },
    });
  }

  async createMember(
    data: CreateMemberInput & {
      password: string;
      signupFormRequest: any;
      sponsorId?: string;
    }
  ) {
    const maxUserId = await this.prisma.member.aggregate({
      _max: {
        userId: true,
      },
    });
    return this.prisma.member.create({
      data: {
        ...data,
        userId: maxUserId._max.userId + 1,
      },
    });
  }

  async updateMember({
    id,
    ...data
  }: UpdateMemberInput & { password?: string; introducerCount?: number }) {
    return this.prisma.member.update({
      where: { id },
      data,
    });
  }

  async updateManyMember(where: Prisma.MemberWhereInput, data: UpdateMemberInput) {
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
      },
      include: {
        package: true,
      },
    });
    const newpoint = sales.reduce((prev, cur) => prev + cur.package.point, 0);
    await this.prisma.member.update({
      where: {
        id,
      },
      data: {
        point: newpoint,
      },
    });
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

  async calculateSponsorBonous(id: string): Promise<void> {
    // if (!id) return;
    // const { introducerCount, freeShareSaleCount } = await this.prisma.member.findUnique({
    //   where: { id },
    // });
    // const actualSaleCount = Math.floor(introducerCount / SPONSOR_BONOUS_CNT);
    // if (actualSaleCount < freeShareSaleCount) {
    //   const remain = freeShareSaleCount - actualSaleCount;
    //   const sales = await this.prisma.sale.findMany({
    //     where: {
    //       memberId: id,
    //       freeShareSale: true,
    //       status: true,
    //     },
    //     orderBy: {
    //       createdAt: 'desc',
    //     },
    //     include: {
    //       statisticsSales: true,
    //     },
    //     take: remain,
    //   });
    //   const permanentDelete = sales.filter((sale) => sale.statisticsSales.length === 0);
    //   const softDelete = sales.filter((sale) => sale.statisticsSales.length > 0);
    //   await this.prisma.sale.deleteMany({
    //     where: {
    //       id: {
    //         in: permanentDelete.map((sale) => sale.id),
    //       },
    //     },
    //   });
    //   await this.prisma.sale.updateMany({
    //     where: {
    //       id: {
    //         in: softDelete.map((sale) => sale.id),
    //       },
    //     },
    //     data: {
    //       status: false,
    //     },
    //   });
    //   await this.prisma.member.update({
    //     where: {
    //       id,
    //     },
    //     data: {
    //       freeShareSaleCount: actualSaleCount,
    //     },
    //   });
    // } else if (actualSaleCount > freeShareSaleCount) {
    //   const member = await this.prisma.member.findUnique({
    //     where: {
    //       id,
    //     },
    //   });
    //   const packageId = member.createdAt < FREE_SHARE_DIVIDER1 ? FREE_SHARE_ID_1 : FREE_SHARE_ID_2;
    //   await this.prisma.sale.createMany({
    //     data: new Array(actualSaleCount - freeShareSaleCount).fill(0).map((_, idx) => ({
    //       memberId: id,
    //       packageId: packageId,
    //       paymentMethod: 'free',
    //       freeShareSale: true,
    //     })),
    //   });
    //   await this.prisma.member.update({
    //     where: {
    //       id,
    //     },
    //     data: {
    //       freeShareSaleCount: actualSaleCount,
    //     },
    //   });
    // }
  }

  async incraseIntroducerCount(id: string): Promise<void> {
    await this.prisma.$queryRaw`
    UPDATE members
      SET "introducerCount" = "introducerCount" + 1, "totalIntroducers" = "totalIntroducers" + 1
      WHERE id=${id}
    `;
  }

  async decreaseIntroducerCount(id: string): Promise<void> {
    await this.prisma.$queryRaw`
    UPDATE members
      SET "introducerCount" = GREATEST("introducerCount" - 1, 0), "totalIntroducers" = GREATEST("totalIntroducers" - 1, 0)
      WHERE id=${id}
    `;
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

  async approveMember(id: string, syncWithSendy?: boolean): Promise<void> {
    const data: any = { status: true };
    if (typeof syncWithSendy !== 'undefined') {
      data.syncWithSendy = true;
    }

    const member = await this.prisma.member.update({
      where: {
        id,
      },
      data,
    });
    if (member.sponsorId) {
      await this.calculateTotalIntroducerCount(member.sponsorId);
      await this.calculateSponsorBonous(member.sponsorId);
    }

    if (member.syncWithSendy) {
      // sendy
      this.sendyService.addSubscriber(member.email, member.fullName);
    }
  }

  async reCalculateCurrentLR(): Promise<void> {
    const currentWeek = dayjs().utc().startOf('week');

    const allMembers = await this.prisma.member.findMany({});
    const mapMembers = {};
    allMembers.forEach((mb) => {
      mapMembers[mb.id] = {
        ...mb,
      };
    });

    const weekSales = await this.prisma.sale.findMany({
      where: {
        orderedAt: {
          gte: currentWeek.toDate(),
        },
      },
      include: {
        member: true,
        package: {
          select: {
            point: true,
          },
        },
      },
    });

    const addedLeftPoint: Record<string, number> = {};
    const addedRightPoint: Record<string, number> = {};

    weekSales.forEach((sale) => {
      addPoint(
        mapMembers,
        {
          id: sale.memberId,
          point: sale.package.point,
        },
        addedLeftPoint,
        addedRightPoint,
        currentWeek.toDate()
      );
    });

    const prevWeekStartDate = currentWeek.subtract(1, 'week').toDate();
    const lastWeeklyCommissions = await this.prisma.weeklyCommission.findMany({
      where: {
        weekStartDate: prevWeekStartDate,
      },
    });
    const resultMap: Record<string, { left: number; right: number }> = {}; //initial with previous status

    const members = await this.prisma.member.findMany({});
    members.forEach((member) => (resultMap[member.id] = { left: 0, right: 0 }));

    if (lastWeeklyCommissions.length > 0) {
      lastWeeklyCommissions.forEach((commissionstatus) => {
        resultMap[commissionstatus.memberId] = {
          left: commissionstatus.endL,
          right: commissionstatus.endR,
        };
      });
    }

    const combinedMap: Record<string, { left: number; right: number }> = {};

    Object.keys(addedLeftPoint).forEach((id) => {
      combinedMap[id] = {
        left: (combinedMap[id]?.left ?? 0) + addedLeftPoint[id],
        right: combinedMap[id]?.right ?? 0,
      };
    });

    Object.keys(addedRightPoint).forEach((id) => {
      combinedMap[id] = {
        left: combinedMap[id]?.left ?? 0,
        right: (combinedMap[id]?.right ?? 0) + addedRightPoint[id],
      };
    });

    await Bluebird.map(
      allMembers,
      async ({ id }) => {
        return this.prisma.member.update({
          data: {
            begL: resultMap[id]?.left ?? 0,
            begR: resultMap[id]?.right ?? 0,
            newL: combinedMap[id].left ?? 0,
            newR: combinedMap[id].right ?? 0,
          },
          where: {
            id,
          },
        });
      },
      { concurrency: 10 }
    );
  }
}
