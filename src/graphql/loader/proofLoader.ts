import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { PFile } from '@/entity/file/file.entity';
import { RefLink } from '@/entity/referenceLink/referenceLink.entity';

export const filesForProofLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, PFile[]>(
    async (proofIds: string[]) => {
      const proofsWithFile = await parent.prisma.fileRelation.findMany({
        where: {
          proofId: {
            in: proofIds,
          },
        },
        select: {
          proofId: true,
          file: true,
        },
      });

      const filesMap: Record<string, PFile[]> = {};
      proofsWithFile.forEach((proof) => {
        if (!filesMap[proof.proofId]) {
          filesMap[proof.proofId] = [];
        }
        filesMap[proof.proofId].push(proof.file);
      });

      return proofIds.map((id) => filesMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const referenceLinksForProofLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, RefLink[]>(
    async (proofIds: string[]) => {
      const proofsWithLinks = await parent.prisma.referenceLink.findMany({
        where: {
          proofId: {
            in: proofIds,
          },
        },
        select: {
          proofId: true,
          link: true,
          linkType: true,
        },
      });

      const linksMap: Record<string, RefLink[]> = {};
      proofsWithLinks.forEach((proof) => {
        if (!linksMap[proof.proofId]) {
          linksMap[proof.proofId] = [];
        }
        linksMap[proof.proofId].push({
          link: proof.link,
          linkType: proof.linkType,
        });
      });

      return proofIds.map((id) => linksMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
