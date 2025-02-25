import { Service } from 'typedi';
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Info,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';

import { WeeklyReport } from './weeklyReport.entity';
import {
  GenerateWeeklyReportInput,
  WeeklyReportQueryArgs,
  WeeklyReportResponse,
} from './weeklyReport.type';
import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { WeeklyReportService } from './weeklyReport.service';
import { UserRole } from '@/type';
import { PFile } from '../file/file.entity';
import { Context } from '@/context';
import { SuccessResponse } from '@/graphql/common.type';
import shelljs from 'shelljs';
import { SuccessResult } from '@/graphql/enum';
import { GENERATE_WEEKLY_REPORT_COMMAND } from '@/consts';

@Service()
@Resolver(() => WeeklyReport)
export class WeeklyReportResolver {
  constructor(private readonly service: WeeklyReportService) {}

  @Authorized([UserRole.ADMIN])
  @Query(() => WeeklyReportResponse)
  async weeklyReports(
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

  @Authorized([UserRole.ADMIN])
  @Mutation(() => SuccessResponse)
  async generateWeeklyReport(@Arg('data') data: GenerateWeeklyReportInput) {
    const { stderr } = shelljs.exec(`${GENERATE_WEEKLY_REPORT_COMMAND} ${data.all ? '-all' : ''}`);

    return {
      result: stderr ? SuccessResult.failed : SuccessResult.success,
      message: stderr
        ? (stderr as string)
            .split('\n')
            .find((err) => err.startsWith('Error: '))
            ?.slice(7) ?? 'Error occurred in generating weekly reports'
        : '',
    };
  }
}
