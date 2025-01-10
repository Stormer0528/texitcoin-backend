import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { Email } from '@/entity/email/email.entity';

export const recipientForRecipientLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member>(
    async (recipientIds: string[]) => {
      const uniqueRecipientIds = [...new Set(recipientIds)];
      const members = await parent.prisma.member.findMany({
        where: { id: { in: uniqueRecipientIds } },
      });

      const membersMap: Record<string, Member> = {};
      members.forEach((member) => {
        membersMap[member.id] = member;
      });

      return uniqueRecipientIds.map((id) => membersMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const emailForRecipientLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Email>(
    async (emailIds: string[]) => {
      const uniqueEmailIds = [...new Set(emailIds)];
      const members = await parent.prisma.email.findMany({
        where: { id: { in: emailIds } },
      });

      const emailsMap: Record<string, Email> = {};
      members.forEach((email) => {
        emailsMap[email.id] = email;
      });

      return uniqueEmailIds.map((id) => emailsMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
