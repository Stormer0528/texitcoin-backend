import type { Prisma } from '@prisma/client';
import { ObjectType, Field, ArgsType } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { WeeklyReport } from './weeklyReport.entity';

// WeeklyReport Query Args
@ArgsType()
export class WeeklyReportQueryArgs extends QueryArgsBase<Prisma.WeeklyReportWhereInput> {}

// WeeklyReport list response with pagination ( total )
@ObjectType()
export class WeeklyReportResponse extends PaginatedResponse {
  @Field(() => [WeeklyReport], { nullable: true })
  weeklyReports?: WeeklyReport[];
}
