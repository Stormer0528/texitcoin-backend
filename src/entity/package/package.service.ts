import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import { CreatePackageInput, PackageQueryArgs, UpdatePackageInput } from './package.type';
import { NO_PRODUCT } from '@/consts';

@Service()
export class PackageService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getPackages(params: PackageQueryArgs) {
    return await this.prisma.package.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getPackagesCount(params: PackageQueryArgs): Promise<number> {
    return this.prisma.package.count({ where: params.where });
  }

  async getPackageById(id: string) {
    return this.prisma.package.findUnique({
      where: {
        id,
      },
    });
  }

  async createPackage(data: CreatePackageInput) {
    return await this.prisma.package.create({
      data,
    });
  }

  async isFreeShare(id: string) {
    const groupSetting = await this.prisma.groupSetting.findFirst({
      where: {
        sponsorBonusPackageId: id,
      },
    });
    return Boolean(groupSetting);
  }
  async updatePackage(data: UpdatePackageInput) {
    const freeShare = await this.isFreeShare(data.id);
    const noProduct = data.id === NO_PRODUCT;
    if (noProduct) {
      throw new Error('Can not edit this product.');
    }
    const sale = await this.prisma.sale.findFirst({
      where: {
        packageId: data.id,
      },
    });
    const { status: oldStatus, enrollVisibility: oldEnrollVisibility } =
      await this.prisma.package.findUnique({
        where: {
          id: data.id,
        },
      });
    const newStatus = 'status' in data ? data.status : oldStatus;
    const newEnrollVisibility =
      'enrollVisibility' in data ? data.enrollVisibility : oldEnrollVisibility;

    const updateData: Omit<UpdatePackageInput, 'id'> =
      freeShare || sale
        ? {
            productName: data.productName,
            enrollVisibility: !newStatus && newEnrollVisibility,
            status: newStatus,
          }
        : {
            ...data,
            enrollVisibility: !newStatus && newEnrollVisibility,
            status: newStatus,
          };
    return await this.prisma.package.update({
      where: {
        id: data.id,
      },
      data: updateData,
    });
  }

  async removePackage(data: IDInput) {
    const freeShare = await this.isFreeShare(data.id);
    const noProduct = data.id === NO_PRODUCT;
    if (freeShare || noProduct) {
      throw new Error('Can not remove this product.');
    }
    return this.prisma.package.delete({
      where: {
        id: data.id,
      },
    });
  }
}
