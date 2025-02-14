import { Request, Response, NextFunction } from 'express';
import { Inject, Service } from 'typedi';

import { CoinMarketCapService } from '@/service/coinmarketcap';

@Service()
export class ExplorerController {
  constructor(
    @Inject(() => CoinMarketCapService)
    private readonly coinmarketcapService: CoinMarketCapService
  ) {}
  async getLatestPrice(_req: Request, res: Response, _next: NextFunction) {
    const value = await this.coinmarketcapService.getLatestPrice();
    res.json(value);
  }
}
