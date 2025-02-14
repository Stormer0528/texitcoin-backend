import { PFile } from '@/entity/file/file.entity';
import RootDataLoader from '.';
import DataLoader from 'dataloader';

export const filesForWeeklyReportLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, PFile>(
    async (fileIds: string[]) => {
      const files = await parent.prisma.file.findMany({
        where: {
          id: {
            in: fileIds,
          },
        },
      });

      const filesMap: Record<string, PFile> = {};
      files.forEach((file) => {
        filesMap[file.id] = file;
      });

      return fileIds.map((id) => filesMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
