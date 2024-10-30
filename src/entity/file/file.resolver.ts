import { Service } from 'typedi';
import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql';

import { PFile } from './file.entity';
import { Context } from '@/context';
import { Sale } from '../sale/sale.entity';

@Service()
@Resolver(() => PFile)
export class FileResolver {
  constructor() {}

  @FieldResolver({ nullable: 'itemsAndList' })
  async sales(@Root() file: PFile, @Ctx() ctx: Context): Promise<Sale[]> {
    return ctx.dataLoader.get('salesForFileLoader').load(file.id);
  }
}
