import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { Recipient } from '@prisma/client';
import { PFile } from '@/entity/file/file.entity';

export const senderForEmailLoader = (parent: RootDataLoader) => {
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

export const recipientsForEmailLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Recipient[]>(
    async (emailIds: string[]) => {
      const recipients = await parent.prisma.recipient.findMany({
        where: { emailId: { in: emailIds } },
      });

      const recipientsMap: Record<string, Recipient[]> = {};
      recipients.forEach((recipient) => {
        if (!recipientsMap[recipient.emailId]) recipientsMap[recipient.emailId] = [];
        recipientsMap[recipient.emailId].push(recipient);
      });

      return emailIds.map((id) => recipientsMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const filesForEmailLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, PFile[]>(
    async (emailIds: string[]) => {
      const emailsWithFile = await parent.prisma.emailAttachment.findMany({
        where: {
          emailId: {
            in: emailIds,
          },
        },
        select: {
          emailId: true,
          file: true,
        },
      });

      const filesMap: Record<string, PFile[]> = {};
      emailsWithFile.forEach((email) => {
        if (!filesMap[email.emailId]) {
          filesMap[email.emailId] = [];
        }
        filesMap[email.emailId].push(email.file);
      });

      return emailIds.map((id) => filesMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
