import { Service } from 'typedi';
import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql';

import { PFile } from './file.entity';
import { Context } from '@/context';
import { Sale } from '../sale/sale.entity';

@Service()
@Resolver(() => PFile)
export class FileResolver {
  constructor() {}

  @FieldResolver({ nullable: true })
  async sale(@Root() file: PFile, @Ctx() ctx: Context): Promise<Sale> {
    return ctx.dataLoader.get('saleForFileLoader').load(file.id);
  }
}
