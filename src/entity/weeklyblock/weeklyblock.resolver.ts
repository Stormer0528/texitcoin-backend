import { Service } from 'typedi';
import { Args, Resolver, Query, Info } from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { WeeklyBlockService } from './weeklyblock.service';
import { WeeklyBlock } from './weeklyblock.entity';
import { WeeklyBlockQueryArgs, WeeklyBlocksResponse } from './weeklyblock.type';

@Service()
@Resolver(() => WeeklyBlock)
export class WeeklyBlockResolver {
  constructor(private readonly service: WeeklyBlockService) {}

  @Query(() => WeeklyBlocksResponse)
  async weeklyblocks(
    @Args() query: WeeklyBlockQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<WeeklyBlocksResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; weeklyblocks?: Promise<WeeklyBlock[]> } = {};

    if ('total' in fields) {
      promises.total = this.service.getWeeklyBlocksCount(query);
    }

    if ('weeklyblocks' in fields) {
      promises.weeklyblocks = this.service.getWeeklyBlocks(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; weeklyblocks?: WeeklyBlock[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }
}
