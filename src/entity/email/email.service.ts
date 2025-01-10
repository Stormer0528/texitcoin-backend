import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { EmailQueryArgs } from './email.type';
import { Prisma } from '@prisma/client';

@Service()
export class EmailService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getEmails(params: EmailQueryArgs) {
    return await this.prisma.email.findMany({
      where: {
        AND: [params.where, { deletedAt: null }],
      },
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getEmailsCount(params: Pick<EmailQueryArgs, 'where'>): Promise<number> {
    return this.prisma.email.count({ where: params.where });
  }

  async getEmailById(id: string) {
    return this.prisma.email.findUnique({
      where: {
        id,
      },
    });
  }

  async createEmail(data: Prisma.XOR<Prisma.EmailUncheckedCreateInput, Prisma.EmailCreateInput>) {
    return this.prisma.email.create({
      data,
    });
  }

  async updateEmail(id: string, data: Prisma.EmailUncheckedUpdateInput | Prisma.EmailUpdateInput) {
    return this.prisma.email.update({
      where: {
        id,
      },
      data,
    });
  }
}
