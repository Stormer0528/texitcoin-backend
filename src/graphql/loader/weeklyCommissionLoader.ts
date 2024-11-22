import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { Proof } from '@/entity/proof/proof.entity';

export const memberForWeeklyCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member>(
    async (memberIds: string[]) => {
      const members = await parent.prisma.member.findMany({
        where: { id: { in: memberIds } },
      });

      const membersMap: Record<string, Member> = {};
      members.forEach((member) => {
        membersMap[member.id] = member;
      });

      return memberIds.map((id) => membersMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const proofForWeeklyCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Proof>(
    async (commissionIds: string[]) => {
      const proofs = await parent.prisma.proof.findMany({
        where: {
          refId: {
            in: commissionIds,
          },
          type: 'COMMISSION',
        },
      });

      const proofsMap: Record<string, Proof> = {};
      proofs.forEach((proof) => {
        proofsMap[proof.refId] = proof;
      });

      return commissionIds.map((id) => proofsMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
