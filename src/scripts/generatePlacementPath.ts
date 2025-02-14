import { Member, Prisma, PrismaClient } from '@prisma/client';
import Bluebird from 'bluebird';

const prisma = new PrismaClient();

const doAllPlacementAncestorsById = (members: Member[], id: string) => {
  const resultMap: Record<string, string> = {};
  let previousIDs: string[] = [id];
  const findID = (orgId: string) => members.find((mb) => mb.id === orgId).ID;

  resultMap[id] = `/${findID(id)}`;
  while (true) {
    const children = members.filter((mb) =>
      previousIDs.some((pID) => pID === mb.placementParentId && mb.placementParentId !== mb.id)
    );
    if (!children.length) break;
    children.forEach((child) => {
      resultMap[child.id] = `${resultMap[child.placementParentId]}/${findID(child.id)}`;
    });
    previousIDs = children.map((child) => child.id);
  }
  return Object.entries(resultMap);
};

const func = async () => {
  const members = await prisma.member.findMany({});
  const paths = doAllPlacementAncestorsById(members, 'affe34e8-891b-41c2-8405-d31df4dadb8c');
  Bluebird.map(
    paths,
    async (path) => {
      await prisma.member.update({
        where: {
          id: path[0],
        },
        data: {
          placementPath: path[1],
        },
      });
    },
    { concurrency: 10 }
  );
};

func();
