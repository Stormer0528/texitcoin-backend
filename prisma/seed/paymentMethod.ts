import { Prisma } from '@prisma/client';
import { hashSync } from 'bcryptjs';

export const paymentMethodData: Prisma.PaymentMethodCreateManyInput[] = [
  {
    name: 'Credit Card',
    visible: true,
  },
  {
    name: 'Zelle',
    visible: true,
  },
  {
    name: 'Cash App',
    visible: true,
  },
  {
    name: 'Venmo',
    visible: true,
  },
  {
    name: 'Paper Check',
    visible: true,
  },
  {
    name: 'Cash',
    visible: true,
  },
  {
    name: 'Kilo of Silver',
    visible: true,
  },
  {
    name: 'Crypto',
    visible: true,
  },
];
