import * as excel from 'node-excel-export';
import { Inject, Service } from 'typedi';
import _ from 'lodash';

import { PERCENT, TXC } from '@/consts/db';
import { PrismaService } from './prisma';
import { INFINITE, PLACEMENT_ROOT, SPONSOR_BONOUS_CNT } from '@/consts';
import { convertNumToString } from '@/utils/convertNumToString';
import Bluebird from 'bluebird';
import dayjs from 'dayjs';
import { formatDate, formatDate2 } from '@/utils/common';
import { fCurrency } from '@/utils/fCurrency';
import { MemberState } from '@prisma/client';

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
  cellVTopNumber: {
    alignment: {
      vertical: 'top',
    },
    numberFormat: {
      numFmt: '0',
    },
  },
  cellVTopDate: {
    alignment: {
      vertical: 'top',
    },
    dateFormat: {
      numFmt: 'mm/dd/yyyy',
    },
  },
  highlighted: {
    font: { color: { rgb: 'FF0000' }, bold: true },
  },
};
interface ExportDataInterface {
  name: string;
  specification: any;
  data: any[];
  merges?: any[];
}

interface RewardDetailDataInterface {
  statisticsId: string;
  txcShared: number;
  hashPower: number;
  percent: number;
  fullName: string;
  username: string;
}

interface MemberRewardDetailDataInterface {
  newBlocks: number;
  totalBlocks: number;
  totalHashPower: number;
  totalMembers: number;
  totalTXCShared: number;
  txcShared: number;
  issuedAt: Date;
  hashPower: number;
  percent: number;
  walletTXC: number;
  address: string;
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
        placementParent: true,
        placementChildren: true,
      },
      orderBy: {
        ID: 'asc',
      },
    });
    const specification = {
      no: {
        displayName: 'No',
        headerStyle: styles.headerNormal,
        width: 30,
      },
      ID: {
        displayName: 'ID',
        headerStyle: styles.headerNormal,
        width: 80,
      },
      username: {
        displayName: 'username',
        headerStyle: styles.headerNormal,
        width: 100,
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
      totalIntroducers: {
        displayName: 'introducers',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      preferredContact: {
        displayName: 'preffered contact',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      prefferedContactDetail: {
        displayName: 'contact details',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      placementParent: {
        displayName: 'placement parent',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      placementPosition: {
        displayName: 'position',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      placementLeft: {
        displayName: 'miner left',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      placementRight: {
        displayName: 'miner right',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      status: {
        displayName: 'status',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      joinedAt: {
        displayName: 'joinedAt',
        headerStyle: styles.headerNormal,
        width: 100,
      },
    };

    const allowStateRender = (allowState: MemberState) => {
      switch (allowState) {
        case 'NONE':
          return 'None';
        case 'PENDING':
          return 'Pending';
        case 'GRAVEYARD':
          return 'Graveyard';
        case 'APPROVED':
          return 'Approved';
      }
      return '';
    };

    const generateMemberData = (allowStateFilter: MemberState) => {
      return members
        .filter((member) => member.allowState === allowStateFilter)
        .map((member, index) => ({
          ...member,
          no: index + 1,
          ID: member.status
            ? convertNumToString({ value: member.ID, prefix: 'M', length: 7 })
            : undefined,
          sponsor: member.sponsorId ? `${member.sponsor.fullName}(${member.sponsor.username})` : '',
          placementParent:
            member.placementParentId && member.id !== PLACEMENT_ROOT
              ? `${member.placementParent.assetId}`
              : '',
          placementPosition:
            member.placementParentId && member.id !== PLACEMENT_ROOT
              ? member.placementPosition
              : '',
          placementLeft: member.placementChildren
            .filter((child) => child.placementPosition === 'LEFT' && child.id !== PLACEMENT_ROOT)
            .map((child) => `${child.assetId}`),
          placementRight: member.placementChildren
            .filter((child) => child.placementPosition === 'RIGHT' && child.id !== PLACEMENT_ROOT)
            .map((child) => `${child.assetId}`),
          status: allowStateRender(allowStateFilter),
          joinedAt: member.createdAt,
        }));
    };

    const approvedMembers = generateMemberData('APPROVED');
    const pendingMembers = generateMemberData('PENDING');
    const graveyardMembers = generateMemberData('GRAVEYARD');

    return this.exportMultiSheetExport([
      {
        name: 'Approved',
        specification,
        data: approvedMembers,
      },
      {
        name: 'Pending',
        specification: _.omit(specification, 'ID'),
        data: pendingMembers,
      },
      {
        name: 'Graveyard',
        specification: _.omit(specification, 'ID'),
        data: graveyardMembers,
      },
    ]);
  }
  public async exportSales() {
    const sales = await this.prisma.sale.findMany({
      include: {
        member: true,
        package: true,
      },
      orderBy: {
        orderedAt: 'desc',
      },
    });
    const specification = {
      no: {
        displayName: 'No',
        headerStyle: styles.headerNormal,
        width: 30,
      },
      ID: {
        displayName: 'ID',
        headerStyle: styles.headerNormal,
        width: 70,
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
      point: {
        displayName: 'point',
        headerStyle: styles.headerNormal,
        width: 70,
      },
      hash: {
        displayName: 'hash',
        headerStyle: styles.headerNormal,
        width: 50,
      },
      member: {
        displayName: 'member',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      assetId: {
        displayName: 'assetId',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      paymentMethod: {
        displayName: 'payment method',
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
      sales.map((sale, idx) => ({
        ...sale,
        no: idx + 1,
        ID: convertNumToString({ value: sale.ID, length: 7, prefix: 'S' }),
        status: sale.status ? 'Active' : 'Inactive',
        member: `${sale.member.fullName} (${sale.member.username})`,
        productName: sale.package.productName,
        amount: sale.package.amount,
        hash: sale.package.token,
        assetId: sale.member.assetId,
        point: sale.package.point,
      }))
    );
  }
  public async exportRewards() {
    const statistics = await this.prisma.statistics.findMany({
      orderBy: {
        issuedAt: 'desc',
      },
      where: {
        status: true,
      },
    });

    const detailedStatistics = await this.prisma.$queryRaw<RewardDetailDataInterface[]>`
      SELECT 
        ms."statisticsId",
        ms."txcShared",
        ms."hashPower",
        ms."percent",
        m."fullName",
        m."username"
      FROM 
        member_statistics ms
      LEFT JOIN 
        members m ON ms."memberId" = m.id
      LEFT JOIN
        statistics s ON ms."statisticsId" = s.id
      WHERE
        s.status = true
      ORDER BY 
        ms."issuedAt" DESC;
    `;

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
      name: {
        displayName: 'Name',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      username: {
        displayName: 'Username',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      txc: {
        displayName: 'TXC',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      hashPower: {
        displayName: 'Hash Power',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      percent: {
        displayName: 'percent',
        headerStyle: styles.headerNormal,
        width: 100,
      },
    };
    const datasetDailyRewardsWithMembers = statistics.map((statistic) => {
      const data = detailedStatistics
        .filter((ds) => ds.statisticsId === statistic.id)
        .map((ds, idx) => {
          return {
            no: idx + 1,
            name: ds.fullName,
            username: ds.username,
            txc: Number(ds.txcShared) / TXC,
            hashPower: ds.hashPower,
            percent: Number(ds.percent) / PERCENT,
          };
        });
      return {
        issuedAt: statistic.issuedAt,
        data,
      };
    });

    return this.exportMultiSheetExport([
      {
        data: datasetDailyRewards,
        name: 'dailyrewards',
        specification: specificationDailyRewards,
      },
      ...datasetDailyRewardsWithMembers.map((ddr) => ({
        data: ddr.data,
        name: formatDate(ddr.issuedAt),
        specification: specificationDailyRewardsWithMembers,
      })),
    ]);
  }
  public async exportOnepointAwayMembers() {
    const members = await this.prisma.$queryRaw<any[]>`
      SELECT *
        FROM members
        WHERE "totalIntroducers" % ${SPONSOR_BONOUS_CNT} = ${SPONSOR_BONOUS_CNT - 1}
        ORDER BY "createdAt" DESC
    `;
    const specification = {
      no: {
        displayName: 'No',
        headerStyle: styles.headerNormal,
        width: 30,
      },
      ID: {
        displayName: 'ID',
        headerStyle: styles.headerNormal,
        width: 80,
      },
      username: {
        displayName: 'username',
        headerStyle: styles.headerNormal,
        width: 100,
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
      totalIntroducers: {
        displayName: 'introducers',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      preferredContact: {
        displayName: 'preffered contact',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      prefferedContactDetail: {
        displayName: 'contact details',
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
      members.map((member, idx) => ({
        ...member,
        no: idx + 1,
        ID: convertNumToString({ value: member.ID, length: 7, prefix: 'M' }),
        joinedAt: member.createdAt,
      }))
    );
  }

  public async exportRewardsByMember(memberId: string) {
    const statistics = await this.prisma.$queryRaw<MemberRewardDetailDataInterface[]>`
      SELECT
        S."newBlocks",
        S."totalBlocks",
        S."totalHashPower",
        S."totalMembers",
        S."txcShared" AS "totalTXCShared",
        S."issuedAt",
        MS."txcShared",
        MS."hashPower",
        MS."percent",
        MW."txc" as "walletTXC",
        MWS."address"
      FROM
        MEMBER_STATISTICS MS
        LEFT JOIN STATISTICS S ON MS."statisticsId" = S.ID
        LEFT JOIN MEMBERS M ON MS."memberId" = M.ID
        LEFT JOIN MEMBERSTATISTICSWALLETS MW ON MW."memberStatisticId" = MS.ID
        LEFT JOIN MEMBERWALLETS MWS ON MWS.ID = MW."memberWalletId"
      WHERE
        S.STATUS = TRUE
	      AND M.ID = ${memberId}
      ORDER BY
        MS."issuedAt" DESC;
    `;

    const specificationDailyRewards = {
      no: {
        displayName: 'No',
        headerStyle: styles.headerNormal,
        width: 30,
      },
      issuedAt: {
        displayName: 'Issued At',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      newBlocks: {
        displayName: 'New Blocks',
        headerStyle: styles.headerNormal,
        width: 90,
      },
      totalBlocks: {
        displayName: 'Total Blocks',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      totalHashPower: {
        displayName: 'Total Hash Power',
        headerStyle: styles.headerNormal,
        width: 120,
      },
      totalMembers: {
        displayName: 'Total Members',
        headerStyle: styles.headerNormal,
        width: 120,
      },
      totalTXCShared: {
        displayName: 'Total TXC shared',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      memberTXC: {
        displayName: 'Youre Reward',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      memberHashPower: {
        displayName: 'Your Hash Power',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      memberPercent: {
        displayName: 'percent',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      walletAddress: {
        displayName: 'Wallet Address',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      walletTXC: {
        displayName: 'Wallet Reward',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      walletPercent: {
        displayName: 'Wallet Percent',
        headerStyle: styles.headerNormal,
        width: 100,
      },
    };

    const uniqueStatistics = [...new Set(statistics.map((st) => formatDate(st.issuedAt)))];
    const merges = uniqueStatistics.flatMap((us) => {
      const startIdx = statistics.findIndex((st) => formatDate(st.issuedAt) === us);
      const endIndex = statistics.findLastIndex((st) => formatDate(st.issuedAt) === us);
      return new Array(9).fill(0).map((_, idx) => {
        return {
          start: {
            row: startIdx + 2,
            column: idx + 2,
          },
          end: {
            row: endIndex + 2,
            column: idx + 2,
          },
        };
      });
    });

    return this.exportData(
      'your rewards',
      specificationDailyRewards,
      statistics.map((statistic, idx) => {
        return {
          no: idx + 1,
          newBlocks: statistic.newBlocks,
          totalBlocks: statistic.totalBlocks,
          totalHashPower: statistic.totalHashPower,
          totalMembers: statistic.totalMembers,
          totalTXCShared: Number(statistic.totalTXCShared) / TXC,
          issuedAt: statistic.issuedAt,
          memberTXC: Number(statistic.txcShared) / TXC,
          memberHashPower: statistic.hashPower,
          memberPercent: statistic.percent / PERCENT,
          walletAddress: statistic.address,
          walletTXC: Number(statistic.walletTXC) / TXC,
          walletPercent: (Number(statistic.walletTXC) / Number(statistic.txcShared)) * 100,
        };
      }),
      merges
    );
  }

  public async exportCommissions() {
    const weekStartDates = await this.prisma.weeklyCommission.groupBy({
      by: 'weekStartDate',
      orderBy: {
        weekStartDate: 'asc',
      },
    });
    const specificationWeeklyCommission = {
      no: {
        displayName: 'No',
        headerStyle: styles.headerNormal,
        width: 30,
      },
      ID: {
        displayName: 'ID',
        headerStyle: styles.headerNormal,
        width: 70,
      },
      miner: {
        displayName: 'Miner',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      assetId: {
        displayName: 'AssetId',
        headerStyle: styles.headerNormal,
        width: 90,
      },
      placementParent: {
        displayName: 'Placement Parent',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      placementPosition: {
        displayName: 'Placement Position',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      begLR: {
        displayName: 'Begin LR',
        headerStyle: styles.headerNormal,
        width: 120,
      },
      newLR: {
        displayName: 'New LR',
        headerStyle: styles.headerNormal,
        width: 120,
      },
      maxLR: {
        displayName: 'Max LR',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      endLR: {
        displayName: 'End LR',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      pkgLR: {
        displayName: 'Package',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      commission: {
        displayName: 'Commission',
        headerStyle: styles.headerNormal,
        width: 100,
      },
      status: {
        displayName: 'Status',
        headerStyle: styles.headerNormal,
        width: 100,
      },
    };

    const excelData: ExportDataInterface[] = await Bluebird.map(
      weekStartDates,
      async (weekStartDate) => {
        const weeklycommissions = await this.prisma.weeklyCommission.findMany({
          where: {
            weekStartDate: weekStartDate.weekStartDate,
          },
          include: {
            member: {
              include: {
                placementParent: true,
              },
            },
          },
          orderBy: {
            commission: 'desc',
          },
        });

        const excelWeeklyCommission = weeklycommissions.map((commission, index: number) => ({
          no: index + 1,
          ID:
            commission.ID > 0
              ? convertNumToString({ value: commission.ID, length: 7, prefix: 'C' })
              : '',
          miner: `${commission.member.fullName} (${commission.member.username})`,
          assetId: commission.member.assetId,
          placementParent:
            commission.member.id !== PLACEMENT_ROOT
              ? `${commission.member.placementParent.fullName}(${commission.member.placementParent.username})`
              : '',
          placementPosition: commission.member.placementPosition,
          begLR: `L${commission.begL}, R${commission.begR}`,
          newLR: `L${commission.newL}, R${commission.newR}`,
          maxLR: `L${commission.maxL}, R${commission.maxR}`,
          endLR: `L${commission.endL}, R${commission.endR}`,
          pkgLR: commission.commission ? `L${commission.pkgL}, R${commission.pkgR}` : '',
          commission: commission.commission,
          status: commission.status,
        }));
        const endDay = dayjs(formatDate(weekStartDate.weekStartDate))
          .add(1, 'week')
          .subtract(1, 'day');
        return {
          name: `${formatDate2(weekStartDate.weekStartDate)}-${formatDate2(endDay.toDate())}`,
          specification: specificationWeeklyCommission,
          data: excelWeeklyCommission,
        };
      }
    );

    return this.exportMultiSheetExport(excelData);
  }

  public async exportMemberInOutRevenue() {
    const memberInOutRevenues = await this.prisma.$queryRaw<
      {
        ID: number;
        username: string;
        fullName: string;
        sponsored: number;
        commission: number;
        percent: number | null;
      }[]
    >`
      WITH
        "salesByMember" AS (
          SELECT
            "memberId",
            SUM(PACKAGES.AMOUNT) AS AMOUNT
          FROM
            SALES
            LEFT JOIN PACKAGES ON SALES."packageId" = PACKAGES.ID
          WHERE
            "amount" > 0
          GROUP BY
            "memberId"
        ),
        "commissionsByMember" AS (
          SELECT
            "memberId",
            SUM(COMMISSION) AS COMMISSION
          FROM
            WEEKLYCOMMISSIONS
          WHERE
            "commission" > 0
            AND "status"::TEXT != 'NONE'
            AND "status"::TEXT != 'PREVIEW'
          GROUP BY
            "memberId"
        ),
        "sponsorSalesByMember" AS (
          SELECT
            M1.ID,
            SUM("salesByMember"."amount") AS AMOUNT
          FROM
            MEMBERS AS M1
            LEFT JOIN MEMBERS AS M2 ON M1.ID = M2."sponsorId"
            LEFT JOIN "salesByMember" ON "salesByMember"."memberId" = M2.ID
          GROUP BY
            M1.ID
        ),
        PRERESULT AS (
          SELECT
            MEMBERS."ID",
            MEMBERS.username,
            MEMBERS."fullName",
            MEMBERS."status",
            COALESCE("sponsorSalesByMember"."amount", 0)::Int AS sponsored,
            COALESCE("commissionsByMember".COMMISSION, 0)::Int AS commission
          FROM
            MEMBERS
            LEFT JOIN "sponsorSalesByMember" ON MEMBERS.ID = "sponsorSalesByMember"."id"
            LEFT JOIN "commissionsByMember" ON MEMBERS.ID = "commissionsByMember"."memberId"  
          WHERE
            MEMBERS.status = true
      ),
      FINALRESULT AS (
        SELECT
          *,
          ROUND(
            CASE
              WHEN commission > 0 AND sponsored = 0 THEN ${INFINITE}
              WHEN sponsored = 0 THEN NULL
              ELSE commission * 1.0 / sponsored * 100
            END,
            2
          ) AS percent
        FROM
          PRERESULT
      )
      SELECT *
      FROM FINALRESULT
      ORDER BY "ID" ASC
    `;
    const specificationMemberInOutRevenue = {
      no: {
        displayName: 'No',
        headerStyle: styles.headerNormal,
        width: 30,
      },
      ID: {
        displayName: 'ID',
        headerStyle: styles.headerNormal,
        width: 70,
      },
      member: {
        displayName: 'Miner',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      commission: {
        displayName: 'Commission ($)',
        headerStyle: styles.headerNormal,
        width: 150,
      },
      sponsored: {
        displayName: 'Sponsored ($)',
        headerStyle: styles.headerNormal,
        width: 90,
      },
      percent: {
        displayName: '%',
        headerStyle: styles.headerNormal,
        width: 100,
        cellStyle: (value) => (value === '###' || Number(value) > 100 ? styles.highlighted : {}),
      },
    };

    const data = memberInOutRevenues.map((revenue, index) => {
      return {
        ...revenue,
        member: `${revenue.fullName} (${revenue.username})`,
        percent: Number(revenue.percent) === INFINITE ? '###' : revenue.percent,
        no: index + 1,
        ID: convertNumToString({
          value: revenue.ID,
          length: 7,
          prefix: 'M',
        }),
        commission: fCurrency(revenue.commission),
        sponsored: fCurrency(revenue.sponsored),
      };
    });

    return this.exportData('member-inout-revenue', specificationMemberInOutRevenue, data);
  }
}
