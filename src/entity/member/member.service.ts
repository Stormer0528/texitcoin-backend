import { PlacementPosition, Prisma } from '@prisma/client';
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
  PLACEMENT_POSITION,
} from './member.type';
import { Member } from './member.entity';
import { SendyService } from '@/service/sendy';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import { addPoint } from '@/utils/addPoint';
import { formatDate } from '@/utils/common';
import Bluebird from 'bluebird';
import { PLACEMENT_ROOT, SPONSOR_BONOUS_CNT } from '@/consts';
import { MailerService } from '@/service/mailer';

dayjs.extend(utcPlugin);

@Service()
export class MemberService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService,
    @Inject(() => SendyService)
    private readonly sendyService: SendyService,
    @Inject(() => MailerService)
    private readonly mailerService: MailerService
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

  async updateMember({ id, ...data }: UpdateMemberInput & { password?: string }) {
    return this.prisma.member.update({
      where: { id },
      data,
    });
  }

  async updateManyMember(
    where: Prisma.MemberWhereInput,
    data: Omit<UpdateMemberInput, 'id'> & { id?: string }
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

  async checkSponsorBonous(id: string, notifyEmail: boolean = true): Promise<void> {
    if (!id) return;
    const { totalIntroducers, username, fullName } = await this.prisma.member.findUnique({
      where: { id },
    });
    if (totalIntroducers && totalIntroducers % SPONSOR_BONOUS_CNT === 0) {
      if (notifyEmail) {
        this.mailerService.notifyMiner3rdIntroducersToAdmin(username, fullName, totalIntroducers);
      }
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

  async approveMember(id: string, syncWithSendy?: boolean) {
    const data: any = { status: true };
    if (typeof syncWithSendy !== 'undefined') {
      data.syncWithSendy = true;
    }

    const prevMember = await this.prisma.member.findUnique({
      where: {
        id,
      },
    });

    const member = await this.prisma.member.update({
      where: {
        id,
        ...(prevMember.ID ? {} : { ID: (await this.getMaxID()) + 1 }),
      },
      data,
    });
    if (member.sponsorId) {
      await this.calculateTotalIntroducerCount(member.sponsorId);
      await this.checkSponsorBonous(member.sponsorId);
    }

    if (member.syncWithSendy) {
      // sendy
      this.sendyService.addSubscriber(member.email, member.fullName);
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

  async getBottomOfTree(id: string, direction: Omit<PlacementPosition, 'NONE'>): Promise<string> {
    const members = await this.prisma.member.findMany({
      select: {
        id: true,
        placementParentId: true,
        placementPosition: true,
      },
    });

    let res = id;
    while (true) {
      const children = members.find(
        (mb) => mb.placementParentId === res && mb.placementPosition === direction
      );
      if (children) {
        res = children.id;
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
    if (parentID === PLACEMENT_ROOT || parentMember.placementPosition != 'NONE') {
      const targetDirection = parentMember.placementPosition === 'LEFT' ? 'RIGHT' : 'LEFT';
      const bottomID = await this.getBottomOfTree(parentID, targetDirection);
      await this.prisma.member.update({
        where: {
          id: targetID,
        },
        data: {
          placementParentId: bottomID,
          placementPosition: targetDirection,
        },
      });
    }
  }
}
