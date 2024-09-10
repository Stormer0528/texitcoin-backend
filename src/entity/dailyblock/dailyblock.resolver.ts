import { Service } from 'typedi';
import { Args, Resolver, Query, Info } from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { DailyBlockQueryArgs, DailyBlocksResponse } from './dailyblock.type';
import { DailyBlock } from './dailyblock.entity';
import { DailyBlockService } from './dailyblock.service';

@Service()
@Resolver(() => DailyBlock)
export class DailyBlockResolver {
  constructor(private readonly service: DailyBlockService) {}

  @Query(() => DailyBlocksResponse)
  async dailyblocks(
    @Args() query: DailyBlockQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<DailyBlocksResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; dailyblocks?: Promise<DailyBlock[]> } = {};

    if ('total' in fields) {
      promises.total = this.service.getDailyBlocksCount(query);
    }

    if ('dailyblocks' in fields) {
      promises.dailyblocks = this.service.getDailyBlocks(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; dailyblocks?: DailyBlock[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }
}
