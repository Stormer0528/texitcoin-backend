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
