import { PrismaClient } from '@prisma/client';
import Bluebird from 'bluebird';
import dayjs, { Dayjs } from 'dayjs';

const prisma = new PrismaClient();

async function func() {
  console.log('Started last rolled operations');

  const members = await prisma.member.findMany({
    where: {
      status: true,
    },
    select: {
      sponsorId: true,
      createdAt: true,
      lastRolledSponsor: true,
      id: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  const sponsorMap: Record<string, number> = {};
  const lastRollSponsorMap: Record<string, Dayjs> = {};
  members.forEach(
    (member) => (lastRollSponsorMap[member.id] = dayjs(member.createdAt, { utc: true }))
  );

  for (let i = 0; i < members.length; i++) {
    const dayjsCreatedAt = dayjs(members[i].createdAt, { utc: true });
    if (members[i].sponsorId !== members[i].id) {
      const sponsorCnt = (sponsorMap[members[i].sponsorId] ?? 0) + 1;
      sponsorMap[members[i].sponsorId] = sponsorCnt;

      if (
        sponsorCnt % 3 === 0 &&
        Math.abs(lastRollSponsorMap[members[i].sponsorId].diff(dayjsCreatedAt, 'day')) < 30
      ) {
        lastRollSponsorMap[members[i].sponsorId] = dayjsCreatedAt;
      }
    }
  }
  await Bluebird.map(members, async (member) => {
    prisma.member.update({
      where: {
        id: member.id,
      },
      data: {
        lastRolledSponsor: lastRollSponsorMap[member.id].toDate(),
      },
    });
  });

  console.log('Finished last rolled operations');
}
console.log(dayjs('2024-01-01').diff('2024-02-01', 'day'));
func();
