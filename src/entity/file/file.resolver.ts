import { Service } from 'typedi';
import { Resolver } from 'type-graphql';

import { PFile } from './file.entity';

@Service()
@Resolver(() => PFile)
export class FileResolver {
  constructor() {}
}
