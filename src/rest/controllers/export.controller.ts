import { Request, Response, NextFunction } from 'express';
import { Inject, Service } from 'typedi';
import dayjs from 'dayjs';

import { ExcelService } from '@/service/excel';

@Service()
export class ExportController {
  constructor(
    @Inject(() => ExcelService)
    private readonly excelService: ExcelService
  ) {}
  async exportMembers(_req: Request, res: Response, _next: NextFunction) {
    res.attachment(`members-${dayjs().format('MMDDYYYY')}.xlsx`);
    res.send(await this.excelService.exportMembers());
  }
  async exportSales(_req: Request, res: Response, _next: NextFunction) {
    res.attachment(`sales-${dayjs().format('MMDDYYYY')}.xlsx`);
    res.send(await this.excelService.exportSales());
  }
  async exportRewards(_req: Request, res: Response, _next: NextFunction) {
    res.attachment(`rewards-${dayjs().format('MMDDYYYY')}.xlsx`);
    res.send(await this.excelService.exportRewards());
  }
  async exportRewardsByMember(req: Request, res: Response, _next: NextFunction) {
    res.attachment(`rewards-${dayjs().format('MMDDYYYY')}.xlsx`);
    res.send(await this.excelService.exportRewardsByMember((req as any).user.id));
  }
  async exportOnepointAwayMembers(_req: Request, res: Response, _next: NextFunction) {
    res.attachment(`onepointaway-members-${dayjs().format('MMDDYYYY')}.xlsx`);
    res.send(await this.excelService.exportOnepointAwayMembers());
  }
  async exportCommissions(_req: Request, res: Response, _next: NextFunction) {
    res.attachment(`commissions-${dayjs().format('MMDDYYYY')}.xlsx`);
    res.send(await this.excelService.exportCommissions());
  }
}
