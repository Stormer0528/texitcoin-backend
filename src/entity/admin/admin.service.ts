import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { AdminQueryArgs, CreateAdminInput, UpdateAdminInput } from './admin.type';

@Service()
export class AdminService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getAdmins(params: AdminQueryArgs) {
    return this.prisma.admin.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getAdminsCount(params: AdminQueryArgs): Promise<number> {
    return this.prisma.admin.count({ where: params.where });
  }

  async getAdminById(id: string) {
    return this.prisma.admin.findUnique({
      where: {
        id,
      },
    });
  }

  async getAdminByUsername(username: string) {
    return this.prisma.admin.findUnique({
      where: {
        username,
      },
    });
  }

  async getAdminByEmail(email: string) {
    return this.prisma.admin.findUnique({
      where: {
        email,
      },
    });
  }

  async createAdmin(data: CreateAdminInput) {
    return this.prisma.admin.create({
      data,
    });
  }

  async updateAdmin({ id, ...data }: UpdateAdminInput) {
    return this.prisma.admin.update({
      where: { id },
      data,
    });
  }

  async updatePassword({ id, password }: { id: string; password: string }) {
    return this.prisma.admin.update({
      where: { id },
      data: { password },
    });
  }

  async removeAdmins({ ids }: { ids: string[] }) {
    return this.prisma.admin.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
