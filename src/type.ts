import { Package, Prisma } from '@prisma/client';

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER', // when this value is used in authchecker, this means only member.
}

export interface SaleReport {
  hashPower: number;
  members: object;
}

export interface SaleReportInput {
  memberId: string;
  ID: string;
  packageName: string;
  orderedAt: Date;
  paymentMethod: string;
}

export interface GroupedByCreatedAt {
  issuedAt: Date;
  _count: {
    _all: number;
  };
}

export interface MineStatInput {
  issuedAt: Date;
  totalBlocks?: number;
  totalHashPower?: number;
  newBlocks: number;
  difficulty?: number;
}

export interface RPCCOMMAND {
  method: string;
  params?: any[];
}

export interface SaleSearchResult {
  id: string;
  memberId: string;
  package: Package;
}

export interface ColumnInterface {
  column: string;
  parsing?: Prisma.Sql;
  sql?: Prisma.Sql;
}

export type USER_ROLE = 'ADMIN' | 'MEMBER';
