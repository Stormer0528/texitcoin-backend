import { Service } from 'typedi';
import { Args, Authorized, Ctx, FieldResolver, Info, Query, Resolver, Root } from 'type-graphql';

import { WeeklyReport } from './weeklyReport.entity';
import { WeeklyReportQueryArgs, WeeklyReportResponse } from './weeklyReport.type';
import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { WeeklyReportService } from './weeklyReport.service';
import { UserRole } from '@/type';
import { PFile } from '../file/file.entity';
import { Context } from '@/context';

@Service()
@Resolver(() => WeeklyReport)
export class WeeklyReportResolver {
  constructor(private readonly service: WeeklyReportService) {}

  @Authorized([UserRole.ADMIN])
  @Query(() => WeeklyReport)
  async members(
    @Args() query: WeeklyReportQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<WeeklyReportResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; weeklyReports?: Promise<WeeklyReport[]> } = {};

    if ('total' in fields) {
      promises.total = this.service.getWeeklyReportsCount(query);
    }

    if ('weeklyReports' in fields) {
      promises.weeklyReports = this.service.getWeeklyReports(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; weeklyReports?: WeeklyReport[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @FieldResolver(() => PFile)
  async file(@Root() weeklyReport: WeeklyReport, @Ctx() ctx: Context): Promise<PFile> {
    return ctx.dataLoader.get('filesForWeeklyReportLoader').load(weeklyReport.fileId);
  }
}
