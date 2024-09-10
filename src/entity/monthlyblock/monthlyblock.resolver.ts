import { Service } from 'typedi';
import { Args, Resolver, Query, Info } from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { MonthlyBlockQueryArgs, MonthlyBlocksResponse } from './monthlyblock.type';
import { MonthlyBlock } from './monthlyblock.entity';
import { MonthlyBlockService } from './monthlyblock.service';

@Service()
@Resolver(() => MonthlyBlock)
export class MonthlyBlockResolver {
  constructor(private readonly service: MonthlyBlockService) {}

  @Query(() => MonthlyBlocksResponse)
  async monthlyblocks(
    @Args() query: MonthlyBlockQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<MonthlyBlocksResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; monthlyblocks?: Promise<MonthlyBlock[]> } = {};

    if ('total' in fields) {
      promises.total = this.service.getMonthlyBlocksCount(query);
    }

    if ('monthlyblocks' in fields) {
      promises.monthlyblocks = this.service.getMonthlyBlocks(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; monthlyblocks?: MonthlyBlock[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }
}
