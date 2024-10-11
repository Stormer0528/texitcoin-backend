import { Prisma } from '@prisma/client';
import { ArgsType, Field } from 'type-graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import _ from 'lodash';

interface OrderBy {
  [key: string]: Prisma.SortOrder;
}

@ArgsType()
export abstract class QueryOrderPagination {
  @Field({ nullable: true })
  sort?: string;

  @Field({ nullable: true })
  page?: string;

  get parsePage(): { take?: number; skip?: number } {
    if (!this.page) {
      return {};
    }

    const [page, limit] = this.page.split(',').map((value) => parseInt(value));

    return {
      take: limit,
      skip: page * limit - limit,
    };
  }

  get orderBy(): OrderBy | OrderBy[] | undefined {
    return this.sort?.split(',').map((field) => {
      const order: Prisma.SortOrder = field.startsWith('-') ? 'asc' : 'desc';
      const res = {};
      _.set(res, field.replace('-', ''), order);
      return res;
    });
  }
}

@ArgsType()
export abstract class QueryArgsBase<WhereType> extends QueryOrderPagination {
  @Field(() => GraphQLJSONObject, { nullable: true })
  filter?: Record<string, any>;

  // This is for type generation, does not validate any actual inputs
  get where(): WhereType | undefined {
    return Prisma.validator<WhereType>()(this.filter as any);
  }
}
