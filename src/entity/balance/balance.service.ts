import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import { BalanceQueryArgs, AddBalanceInput, UpdateBalanceInput } from './balance.type';
import { MemberService } from '../member/member.service';

@Service()
export class BalanceService {
  constructor(
    private readonly memberService: MemberService,
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getBalances(params: BalanceQueryArgs) {
    return await this.prisma.balance.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getBalancesCount(params: BalanceQueryArgs): Promise<number> {
    return this.prisma.balance.count({ where: params.where });
  }

  async getBalanceById(id: string) {
    return this.prisma.balance.findUnique({
      where: {
        id,
      },
    });
  }

  async addBalance(data: AddBalanceInput) {
    const balanceEntry = await this.prisma.balance.create({
      data,
    });
    await this.memberService.updateBalanceByMemberId(data.memberId);
    return balanceEntry;
  }

  async updateBalance(data: UpdateBalanceInput) {
    const balanceEntry = await this.prisma.balance.update({
      where: {
        id: data.id,
      },
      data,
    });
    await this.memberService.updateBalanceByMemberId(balanceEntry.memberId);
    return balanceEntry;
  }

  async removeBalance(data: IDInput) {
    const balanceEntry = await this.prisma.balance.delete({
      where: {
        id: data.id,
      },
    });
    await this.memberService.updateBalanceByMemberId(balanceEntry.memberId);
    return balanceEntry;
  }
}
