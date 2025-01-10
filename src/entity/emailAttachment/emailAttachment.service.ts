import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { ManyEmailAttachmentsInput } from './emailAttachment.type';

@Service()
export class EmailAttachmentService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async setEmailAttachments(data: ManyEmailAttachmentsInput) {
    await this.prisma.emailAttachment.deleteMany({
      where: {
        emailId: data.emailId,
      },
    });
    return this.prisma.emailAttachment.createMany({
      data: data.fileIds.map((fileId) => ({
        emailId: data.emailId,
        fileId,
      })),
    });
  }
}
