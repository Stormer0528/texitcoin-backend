import { Prisma } from '@prisma/client';
import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { CreateBlockInput, BlockQueryArgs } from './block.type';

@Service()
export class BlockService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getBlocks(params: BlockQueryArgs) {
    return this.prisma.block.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getBlockDataRange(params: Prisma.BlockWhereInput) {
    const {
      _min: { createdAt: from },
      _max: { createdAt: to },
      _count: count,
    } = await this.prisma.block.aggregate({
      _min: {
        createdAt: true,
      },
      _max: {
        createdAt: true,
      },
      _count: true,
      where: {
        ...params,
      },
    });
    return { from, to, count };
  }

  async getBlocksCount(params: Pick<BlockQueryArgs, 'where'>): Promise<number> {
    return this.prisma.block.count({ where: params.where });
  }

  async getBlockById(id: string) {
    return this.prisma.block.findUnique({
      where: {
        id,
      },
    });
  }

  async getLatestBlock() {
    return this.prisma.block.findFirst({
      orderBy: {
        blockNo: 'desc',
      },
    });
  }

  async getBlocksCountByDate(range: { start: Date; end: Date }) {
    return await this.prisma.$queryRaw<{ date: Date; count: number }[]>`
      SELECT 
        DATE("createdAt") as date, 
        CAST(COUNT("blockNo") as INT) as count
      FROM 
        Blocks
      WHERE 
        "createdAt" BETWEEN ${range.start} AND ${range.end}
      GROUP BY 
        DATE("createdAt")
      ORDER BY
        date ASC`;
  }

  async getTimeTookForBlock(range: { start: Date; end: Date }, blockLimit: number = 10) {
    return this.prisma.$queryRaw<{ blockNo: number; timeTookInSeconds: number }[]>`
      SELECT 
        "blockNo",
        EXTRACT(EPOCH FROM ("createdAt" - LAG("createdAt") OVER (ORDER BY "createdAt"))) AS "timeTookInSeconds"
      FROM 
        Blocks
      WHERE 
        "createdAt" BETWEEN ${range.start} AND ${range.end}
      ORDER BY
        "blockNo" DESC
      LIMIT ${blockLimit}`;
  }

  async createBlock(data: CreateBlockInput) {
    return this.prisma.block.create({
      data,
    });
  }
}
