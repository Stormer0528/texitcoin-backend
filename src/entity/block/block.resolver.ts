import { Service } from 'typedi';
import { Arg, Args, Resolver, Query, Mutation, Authorized, Info } from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { UserRole } from '@/type';

import { BlocksResponse, BlockQueryArgs, CreateBlockInput } from './block.type';
import { Block } from './block.entity';
import { BlockService } from './block.service';

@Service()
@Resolver(() => Block)
export class BlockResolver {
  constructor(private readonly service: BlockService) {}

  @Query(() => BlocksResponse)
  async blocks(
    @Args() query: BlockQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<BlocksResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; blocks?: Promise<Block[]> } = {};

    if ('total' in fields) {
      promises.total = this.service.getBlocksCount(query);
    }

    if ('blocks' in fields) {
      promises.blocks = this.service.getBlocks(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; blocks?: Block[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => Block)
  async createBlock(@Arg('data') data: CreateBlockInput): Promise<Block> {
    return this.service.createBlock(data);
  }
}
