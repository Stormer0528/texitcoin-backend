import { registerEnumType } from 'type-graphql';

export enum PlacementPosition {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum Confirmation4Status {
  NONE = 'NONE',
  PENDING = 'PENDING',
  CONFIRM = 'CONFIRM',
  BLOCK = 'BLOCK',
}

export enum SuccessResult {
  success = 'success',
  failed = 'failed',
}

registerEnumType(PlacementPosition, {
  name: 'PlacementPosition',
});

registerEnumType(Confirmation4Status, {
  name: 'Confirmation4Status',
});

registerEnumType(SuccessResult, {
  name: 'SuccessResult',
});
