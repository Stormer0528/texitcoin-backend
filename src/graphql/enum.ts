import { registerEnumType } from 'type-graphql';

export enum PlacementPosition {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum Confirmation3Status {
  PENDING = 'PENDING',
  CONFIRM = 'CONFIRM',
  BLOCK = 'BLOCK',
}

registerEnumType(PlacementPosition, {
  name: 'PlacementPosition',
});

registerEnumType(Confirmation3Status, {
  name: 'Confirmation3Status',
});
