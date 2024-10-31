import { Prisma } from '@prisma/client';

import { PAYOUTS } from '../../src/consts';

export const payoutData: Prisma.PayoutCreateManyInput[] = [
  {
    id: PAYOUTS[0],
    method: 'TXC-COLD',
    status: true,
    name: 'txc-cold',
    display: 'TXC Cold Wallet Address',
  },
  {
    id: PAYOUTS[1],
    method: 'TXC-HOT',
    status: true,
    name: 'txc-hot',
    display: 'TXC Hot Wallet Address',
  },
  {
    id: PAYOUTS[2],
    method: 'BTC',
    status: true,
    name: 'btc',
    display: 'BTC Wallet Address',
  },
  {
    id: PAYOUTS[3],
    method: 'USDT',
    status: true,
    name: 'usdt',
    display: 'USDT Wallet Address',
  },
  {
    id: PAYOUTS[4],
    method: 'ETH',
    status: true,
    name: 'eth',
    display: 'ETH Wallet Address',
  },
  {
    id: PAYOUTS[5],
    method: 'Other',
    status: true,
    name: 'other',
    display: 'Other Wallet Address',
  },
];
