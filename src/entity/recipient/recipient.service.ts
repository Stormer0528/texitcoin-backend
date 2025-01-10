import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { RecipientQueryArgs } from './recipient.type';
import { Prisma } from '@prisma/client';

@Service()
export class RecipientService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getRecipients(params: RecipientQueryArgs) {
    return await this.prisma.recipient.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getRecipientsCount(params: RecipientQueryArgs): Promise<number> {
    return this.prisma.recipient.count({ where: params.where });
  }

  async getRecipientById(id: string) {
    return this.prisma.recipient.findUnique({
      where: {
        id,
      },
    });
  }

  async createRecipient(
    data: Prisma.XOR<Prisma.RecipientUncheckedCreateInput, Prisma.RecipientCreateInput>
  ) {
    return await this.prisma.recipient.create({
      data,
    });
  }

  async createRecipients(data: Prisma.RecipientCreateManyInput[]) {
    return await this.prisma.recipient.createMany({
      data,
    });
  }

  async updateRecipient(
    id: string,
    data: Prisma.XOR<Prisma.RecipientUncheckedUpdateInput, Prisma.RecipientUpdateInput>
  ) {
    return await this.prisma.recipient.update({
      where: {
        id,
      },
      data,
    });
  }

  async getRecipientIdsByUsernames(usernames: string[]) {
    const recipients = await this.prisma.member.findMany({
      where: {
        username: {
          in: usernames,
        },
      },
      select: {
        id: true,
        username: true,
      },
    });
    // non exist usernames
    const nonExistUsernames = usernames.filter(
      (username) => !recipients.some((recipient) => recipient.username === username)
    );

    return [recipients.map((recipient) => recipient.id), nonExistUsernames];
  }
}
