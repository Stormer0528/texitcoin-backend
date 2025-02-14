import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import {
  AdminNotesQueryArgs,
  CreateAdminNotesInput,
  UpdateAdminNotesInput,
} from './adminNotes.type';

@Service()
export class AdminNotesService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getAdminNotes(params: AdminNotesQueryArgs) {
    return await this.prisma.adminNotes.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getAdminNotesCount(params: AdminNotesQueryArgs): Promise<number> {
    return this.prisma.adminNotes.count({ where: params.where });
  }

  async getAdminNoteById(id: string) {
    return this.prisma.adminNotes.findUnique({
      where: {
        id,
      },
    });
  }

  async createAdminNote(data: CreateAdminNotesInput & { adminId: string }) {
    return await this.prisma.adminNotes.create({
      data,
    });
  }

  async updateAdminNote(data: UpdateAdminNotesInput) {
    return await this.prisma.adminNotes.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async removeAdminNote(data: IDInput) {
    return this.prisma.adminNotes.delete({
      where: {
        id: data.id,
      },
    });
  }
}
