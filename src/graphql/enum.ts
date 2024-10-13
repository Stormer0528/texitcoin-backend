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

registerEnumType(PlacementPosition, {
  name: 'PlacementPosition',
});

registerEnumType(Confirmation4Status, {
  name: 'Confirmation4Status',
});
