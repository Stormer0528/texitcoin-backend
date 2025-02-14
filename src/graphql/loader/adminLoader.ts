import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { AdminNotes } from '@prisma/client';

export const adminNotesForAdminLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, AdminNotes[]>(
    async (adminIds: string[]) => {
      const adminNotes = await parent.prisma.adminNotes.findMany({
        where: {
          adminId: {
            in: adminIds,
          },
        },
      });
      const adminsWithAdminNotesMap: Record<string, AdminNotes[]> = {};
      adminNotes.forEach((adaminNotes) => {
        if (!adminsWithAdminNotesMap[adaminNotes.adminId])
          adminsWithAdminNotesMap[adaminNotes.adminId] = [];
        adminsWithAdminNotesMap[adaminNotes.adminId].push(adaminNotes);
      });

      return adminIds.map((id) => adminsWithAdminNotesMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
