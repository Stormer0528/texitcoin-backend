import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';
import { PFile } from '../file/file.entity';

@ObjectType()
export class WeeklyReport extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  weekStartDate: Date;

  @Field()
  fileId: string;

  @Field(() => PFile)
  file?: PFile;
}
