import { UserRole } from '@/type';
import { registerEnumType } from 'type-graphql';

export enum PlacementPosition {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  NONE = 'NONE',
}

export enum ConfirmationStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  DECLINED = 'DECLINED',
  PREVIEW = 'PREVIEW',
}

export enum ProofType {
  COMMISSION = 'COMMISSION',
  MINENEWEQUIPMENT = 'MINENEWEQUIPMENT',
  MINEELECTRICITY = 'MINEELECTRICITY',
  MINEMAINTAINANCE = 'MINEMAINTAINANCE',
  MINEFACILITYRENTMORTAGE = 'MINEFACILITYRENTMORTAGE',
  MARKETINGTXCPROMOTION = 'MARKETINGTXCPROMOTION',
  MARKETINGMINETXCPROMOTION = 'MARKETINGMINETXCPROMOTION',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  OVERHEAD = 'OVERHEAD',
  ADMINISTRATIONSALARY = 'ADMINISTRATIONSALARY',
  PROMOTION = 'PROMOTION',
  PROFIT = 'PROFIT',
  SALE = 'SALE',
  DEVELOPERSPROTOCOL = 'DEVELOPERSPROTOCOL',
  DEVELOPERSWEB = 'DEVELOPERSWEB',
  DEVELOPERSAPPS = 'DEVELOPERSAPPS',
  DEVELOPERSINTEGRATIONS = 'DEVELOPERSINTEGRATIONS',
  EXCHANGEFEE = 'EXCHANGEFEE',
  TRANSACTIONPROCESSING = 'TRANSACTIONPROCESSING',
}

export enum SuccessResult {
  success = 'success',
  failed = 'failed',
}

export enum TeamStrategy {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  BALANCE = 'BALANCE',
  MANUAL = 'MANUAL',
}

export enum TeamReport {
  NONE = 'NONE',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  ALL = 'ALL',
}

export enum TeamReportSection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  REFERRAL = 'REFERRAL',
}

export enum NotificationLevel {
  ALL = 'ALL',
  INDIVIDUAL = 'INDIVIDUAL',
  TEAMLEADER = 'TEAMLEADER',
}

export enum MemberState {
  PENDING = 'PENDING',
  GRAVEYARD = 'GRAVEYARD',
  APPROVED = 'APPROVED',
}

registerEnumType(PlacementPosition, {
  name: 'PlacementPosition',
});

registerEnumType(ConfirmationStatus, {
  name: 'ConfirmationStatus',
});

registerEnumType(SuccessResult, {
  name: 'SuccessResult',
});

registerEnumType(ProofType, {
  name: 'ProofType',
});

registerEnumType(TeamStrategy, {
  name: 'TeamStrategy',
});

registerEnumType(NotificationLevel, {
  name: 'NotificationLevel',
});

registerEnumType(UserRole, {
  name: 'UserRole',
});

registerEnumType(TeamReport, {
  name: 'TeamReport',
});

registerEnumType(TeamReportSection, {
  name: 'TeamReportSection',
});

registerEnumType(MemberState, {
  name: 'MemberState',
});
