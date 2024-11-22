import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Proof } from '@/entity/proof/proof.entity';
import { WeeklyCommission } from '@/entity/weeklycommission/weeklycommission.entity';

export const commissionForPrepaidCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, WeeklyCommission>(
    async (weeklyCommissionIds: string[]) => {
      const uniqueweeklyCommissionIds = [...new Set(weeklyCommissionIds)];
      const weeklyCommissions = await parent.prisma.weeklyCommission.findMany({
        where: { id: { in: weeklyCommissionIds } },
      });

      const commissionMap: Record<string, WeeklyCommission> = {};
      weeklyCommissions.forEach((commission) => {
        commissionMap[commission.id] = commission;
      });

      return uniqueweeklyCommissionIds.map((id) => commissionMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const proofForPrepaidCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Proof>(
    async (prepaidIds: string[]) => {
      const proofs = await parent.prisma.proof.findMany({
        where: {
          refId: {
            in: prepaidIds,
          },
          type: 'PREPAY',
        },
      });

      const proofsMap: Record<string, Proof> = {};
      proofs.forEach((proof) => {
        proofsMap[proof.refId] = proof;
      });

      return prepaidIds.map((id) => proofsMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
