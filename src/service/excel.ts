import { Inject, Service } from 'typedi';
import * as excel from 'node-excel-export';
import { PrismaService } from './prisma';
import { PERCENT, TXC } from '@/consts/db';

const styles = {
  headerNormal: {
    font: {
      color: {
        rgb: '000000',
      },
      sz: 14,
      bold: true,
    },
  },
  cellVTop: {
    alignment: {
      vertical: 'top',
    },
  },
};
interface ExportDataInterface {
  name: string;
  specification: any;
  data: any[];
  merges?: any[];
}

@Service()
export class ExcelService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  public exportData(exportName: string, specification: any, dataset: any[], merges?: any[]) {
    return excel.buildExport([{ name: exportName, specification, data: dataset, merges }]);
  }
  public exportMultiSheetExport(data: ExportDataInterface[]) {
    return excel.buildExport(data);
  }

  public async exportMembers() {
    const members = await this.prisma.member.findMany({
      include: {
        sponsor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const specification = {
      no: {
        displayName: 'No',
        headerStyle: styles.headerNormal,
        width: 30,
      },
      username: {
        displayName: 'username',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      userId: {
        displayName: 'userId',
        headerStyle: styles.headerNormal,
        width: 60,
      },
      fullName: {
        displayName: 'fullname',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      email: {
        displayName: 'email',
        headerStyle: styles.headerNormal,
        width: 200,
      },
      mobile: {
        displayName: 'mobile',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      assetId: {
        displayName: 'assetId',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      primaryAddress: {
        displayName: 'primaryAddress',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      secondaryAddress: {
        displayName: 'secondaryAddress',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      state: {
        displayName: 'state',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      city: {
        displayName: 'city',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      zipCode: {
        displayName: 'zipCode',
        headerStyle: styles.headerNormal,
        width: 80,
      },
      sponsor: {
        displayName: 'sponsor',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      joinedAt: {
        displayName: 'joinedAt',
        headerStyle: styles.headerNormal,
        width: 100,
      },
    };
    return this.exportData(
      'members',
      specification,
      members.map((member, index: number) => ({
        ...member,
        no: index + 1,
        sponsor: member.sponsor?.fullName,
        joinedAt: member.createdAt,
      }))
    );
  }
  public async exportSales() {
    const sales = await this.prisma.sale.findMany({
      include: {
        member: true,
        package: true,
      },
      orderBy: {
        invoiceNo: 'asc',
      },
    });
    const specification = {
      no: {
        displayName: 'No',
        headerStyle: styles.headerNormal,
        width: 30,
      },
      invoiceNo: {
        displayName: 'invoiceNo',
        headerStyle: styles.headerNormal,
        width: 80,
      },
      productName: {
        displayName: 'productName',
        headerStyle: styles.headerNormal,
        width: 200,
      },
      amount: {
        displayName: 'amount',
        headerStyle: styles.headerNormal,
        width: 70,
      },
      hash: {
        displayName: 'hash',
        headerStyle: styles.headerNormal,
        width: 50,
      },
      memberName: {
        displayName: 'memberName',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      memberUsername: {
        displayName: 'memberUsername',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      paymentMethod: {
        displayName: 'paymentMethod',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      orderedAt: {
        displayName: 'orderedAt',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      status: {
        displayName: 'status',
        headerStyle: styles.headerNormal,
        width: 50,
      },
    };
    return this.exportData(
      'sales',
      specification,
      sales.map((sale, index: number) => ({
        ...sale,
        no: index + 1,
        status: sale.status ? 'Active' : 'Inactive',
        memberName: sale.member.fullName,
        memberUsername: sale.member.username,
        productName: sale.package.productName,
        amount: sale.package.amount,
        hash: sale.package.token,
      }))
    );
  }
  public async exportRewards() {
    const statistics = await this.prisma.statistics.findMany({
      include: {
        memberStatistics: {
          include: {
            member: true,
            memberStatisticsWallets: true,
          },
        },
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });
    const specificationDailyRewards = {
      no: {
        displayName: 'No',
        headerStyle: styles.headerNormal,
        width: 30,
      },
      newBlocks: {
        displayName: 'newBlocks',
        headerStyle: styles.headerNormal,
        width: 90,
      },
      totalBlocks: {
        displayName: 'totalBlocks',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      totalHashPower: {
        displayName: 'totalHashPower',
        headerStyle: styles.headerNormal,
        width: 120,
      },
      totalMembers: {
        displayName: 'totalMembers',
        headerStyle: styles.headerNormal,
        width: 120,
      },
      txcShared: {
        displayName: 'txcShared',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      from: {
        displayName: 'from',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      to: {
        displayName: 'to',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      issuedAt: {
        displayName: 'issuedAt',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      transactionId: {
        displayName: 'transactionId',
        headerStyle: styles.headerNormal,
        width: 500,
      },
      status: {
        displayName: 'status',
        headerStyle: styles.headerNormal,
        width: 100,
      },
    };
    const datasetDailyRewards = statistics.map((statistic, index: number) => ({
      ...statistic,
      no: index + 1,
      status: statistic.status ? 'Confirmed' : 'Pending',
      txcShared: Number(statistic.txcShared) / TXC,
    }));
    const specificationDailyRewardsWithMembers = {
      no: {
        displayName: 'No',
        headerStyle: styles.headerNormal,
        width: 30,
      },
      totalHashPower: {
        displayName: 'totalHashPower',
        headerStyle: styles.headerNormal,
        cellStyle: styles.cellVTop,
        width: 120,
      },
      totalMembers: {
        displayName: 'totalMembers',
        headerStyle: styles.headerNormal,
        cellStyle: styles.cellVTop,
        width: 120,
      },
      txcShared: {
        displayName: 'txcShared',
        headerStyle: styles.headerNormal,
        cellStyle: styles.cellVTop,
        width: 100,
      },
      issuedAt: {
        displayName: 'issuedAt',
        headerStyle: styles.headerNormal,
        cellStyle: styles.cellVTop,
        width: 100,
      },
      memberName: {
        displayName: 'memberName',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      memberUsername: {
        displayName: 'memberUsername',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      memberTXC: {
        displayName: 'memberTXC',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      memberHashPower: {
        displayName: 'memberHashPower',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      percent: {
        displayName: 'percent',
        headerStyle: styles.headerNormal,
        width: 100,
      },
    };
    const datasetDailyRewardsWithMembers = [];
    const mergesDailyRewardsWithMembers = [];
    statistics.forEach((statistic) => {
      if (!statistic.status) return;
      const preLength = datasetDailyRewardsWithMembers.length;
      statistic.memberStatistics.forEach((memberstatistic) => {
        datasetDailyRewardsWithMembers.push({
          no: datasetDailyRewardsWithMembers.length + 1,
          issuedAt: statistic.issuedAt,
          totalHashPower: statistic.totalHashPower,
          totalMembers: statistic.totalMembers,
          txcShared: Number(statistic.txcShared) / TXC,
          memberName: memberstatistic.member.fullName,
          memberUsername: memberstatistic.member.username,
          memberTXC: Number(memberstatistic.txcShared) / TXC,
          memberHashPower: memberstatistic.hashPower,
          percent: Number(memberstatistic.percent) / PERCENT,
        });
      });
      mergesDailyRewardsWithMembers.push(
        {
          start: {
            row: preLength + 2,
            column: 2,
          },
          end: {
            row: datasetDailyRewardsWithMembers.length + 1,
            column: 2,
          },
        },
        {
          start: {
            row: preLength + 2,
            column: 3,
          },
          end: {
            row: datasetDailyRewardsWithMembers.length + 1,
            column: 3,
          },
        },
        {
          start: {
            row: preLength + 2,
            column: 4,
          },
          end: {
            row: datasetDailyRewardsWithMembers.length + 1,
            column: 4,
          },
        },
        {
          start: {
            row: preLength + 2,
            column: 5,
          },
          end: {
            row: datasetDailyRewardsWithMembers.length + 1,
            column: 5,
          },
        }
      );
    });
    return this.exportMultiSheetExport([
      {
        data: datasetDailyRewards,
        name: 'dailyrewards',
        specification: specificationDailyRewards,
      },
      {
        data: datasetDailyRewardsWithMembers,
        name: 'dailyrewards_with_members',
        specification: specificationDailyRewardsWithMembers,
        merges: mergesDailyRewardsWithMembers,
      },
    ]);
  }
}
