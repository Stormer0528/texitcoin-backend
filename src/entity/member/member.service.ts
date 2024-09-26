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
import { SPONSOR_BONOUS_CNT } from '@/consts';

import {
  CreateMemberInput,
  UpdateMemberInput,
  MemberQueryArgs,
  ResetPasswordTokenInput,
  VerifyTokenResponse,
  EmailVerificationInput,
} from './member.type';
import { Member } from './member.entity';

@Service()
export class MemberService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
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

  async createMember(data: CreateMemberInput & { password: string; signupFormRequest: any }) {
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

  async updateMember({ id, ...data }: UpdateMemberInput & { password?: string }) {
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
        email: data.email.toLowerCase(),
      },
    });

    if (!member) {
      throw new Error('Can not find email');
    } else if (member.emailVerified) {
      return this.prisma.member.update({
        where: {
          email: data.email.toLowerCase(),
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
        email: data.email.toLowerCase(),
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
    if (!id) return;
    const sponsortMembersCnt = await this.prisma.member.count({ where: { sponsorId: id } });
    const sponsorRewardCnt = Math.floor(sponsortMembersCnt / SPONSOR_BONOUS_CNT);
    const saleCnt = await this.prisma.sale.count({
      where: {
        memberId: id,
        package: {
          isFreeShare: true,
        },
        status: true,
      },
    });

    if (sponsorRewardCnt < saleCnt) {
      const remain = saleCnt - sponsorRewardCnt;
      const sales = await this.prisma.sale.findMany({
        where: {
          memberId: id,
          package: {
            isFreeShare: true,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          statisticsSales: true,
        },
        take: remain,
      });

      const permanentDelete = sales.filter((sale) => sale.statisticsSales.length === 0);
      const softDelete = sales.filter((sale) => sale.statisticsSales.length > 0);

      await this.prisma.sale.deleteMany({
        where: {
          id: {
            in: permanentDelete.map((sale) => sale.id),
          },
        },
      });
      await this.prisma.sale.updateMany({
        where: {
          id: {
            in: softDelete.map((sale) => sale.id),
          },
        },
        data: {
          status: false,
        },
      });
    } else if (sponsorRewardCnt > saleCnt) {
      const { invoiceNo: maxInvoiceNo } = await this.prisma.sale.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
      });
      const member = await this.prisma.member.findUnique({
        where: {
          id,
        },
      });
      const { id: packageId } = await this.prisma.package.findFirst({
        where: {
          freePeriodFrom: {
            lte: member.createdAt,
          },
          freePeriodTo: {
            gt: member.createdAt,
          },
          isFreeShare: true,
        },
      });

      if (packageId) {
        await this.prisma.sale.createMany({
          data: new Array(sponsorRewardCnt - saleCnt).fill(0).map((_, idx) => ({
            memberId: id,
            packageId: packageId,
            paymentMethod: 'free',
            invoiceNo: maxInvoiceNo + idx + 1,
          })),
        });
      } else {
        const { id: packageId } = await this.prisma.package.findFirst({
          where: {
            isFreeShare: true,
            freePeriodFrom: {
              lte: member.createdAt,
            },
          },
          orderBy: {
            freePeriodFrom: 'desc',
          },
        });

        await this.prisma.sale.createMany({
          data: new Array(sponsorRewardCnt - saleCnt).fill(0).map((_, idx) => ({
            memberId: id,
            packageId: packageId,
            paymentMethod: 'free',
            invoiceNo: maxInvoiceNo + idx + 1,
          })),
        });
      }
    }
  }
}
