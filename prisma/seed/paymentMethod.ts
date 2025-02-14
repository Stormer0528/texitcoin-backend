import { PAYMENT_METHODS } from '../../src/consts';
import { Prisma } from '@prisma/client';

export const paymentMethodData: Prisma.PaymentMethodCreateManyInput[] = [
  {
    id: PAYMENT_METHODS[0],
    name: 'Credit Card',
    visible: true,
  },
  {
    id: PAYMENT_METHODS[1],
    name: 'Zelle',
    visible: true,
  },
  {
    id: PAYMENT_METHODS[2],
    name: 'Cash App',
    visible: true,
  },
  {
    id: PAYMENT_METHODS[3],
    name: 'Venmo',
    visible: true,
  },
  {
    id: PAYMENT_METHODS[4],
    name: 'Paper Check',
    visible: true,
  },
  {
    id: PAYMENT_METHODS[5],
    name: 'Cash',
    visible: true,
  },
  {
    id: PAYMENT_METHODS[6],
    name: 'Kilo of Silver',
    visible: true,
  },
  {
    id: PAYMENT_METHODS[7],
    name: 'Crypto',
    visible: true,
  },
];
