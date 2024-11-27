import { registerEnumType } from 'type-graphql';

export enum PlacementPosition {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
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
  PREPAY = 'PREPAY',
  DEVELOPERSPROTOCOL = 'DEVELOPERSPROTOCOL',
  DEVELOPERSWEB = 'DEVELOPERSWEB',
  DEVELOPERSAPPS = 'DEVELOPERSAPPS',
  DEVELOPERSINTEGRATIONS = 'DEVELOPERSINTEGRATIONS',
  EXCHANGEFEE = 'EXCHANGEFEE',
}

export enum SuccessResult {
  success = 'success',
  failed = 'failed',
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
