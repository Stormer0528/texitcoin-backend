import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { Proof } from '@/entity/proof/proof.entity';

export const memberForPrepaidCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member>(
    async (memberIds: string[]) => {
      const uniqueMemberIds = [...new Set(memberIds)];
      const members = await parent.prisma.member.findMany({
        where: { id: { in: uniqueMemberIds } },
      });

      const membersMap: Record<string, Member> = {};
      members.forEach((member) => {
        membersMap[member.id] = member;
      });

      return uniqueMemberIds.map((id) => membersMap[id]);
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

      return prepaidIds.map((id) => proofs[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
