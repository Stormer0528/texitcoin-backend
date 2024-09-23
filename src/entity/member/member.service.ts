import { Prisma } from '@prisma/client';
import { Service, Inject } from 'typedi';

import { EmailInput, TokenInput } from '@/graphql/common.type';
import { createVerificationToken, generateRandomString, hashPassword } from '@/utils/auth';
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
    return this.prisma.member.update({
      where: {
        email: data.email.toLowerCase(),
      },
      data: {
        token,
      },
    });
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
    const randomDigit = Math.floor(Math.random() * 899999) + 100000;
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
    return this.prisma.member.update({
      where: {
        token: data.token,
        email: data.email,
      },
      data: {
        token: null,
        emailVerified: true,
      },
    });
  }
}
