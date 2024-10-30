import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';
import { Sale } from '../sale/sale.entity';

@ObjectType()
export class PFile extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field()
  originalName: string;

  @Field()
  mimeType: string;

  @Field()
  size: number;

  @Field({ nullable: true })
  localPath: string;

  @Field(() => [Sale], { nullable: 'itemsAndList' })
  sales?: Sale[];
}
