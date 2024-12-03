import { ColumnInterface } from '@/type';
import { Prisma } from '@prisma/client';
import { getColumnQuery } from './getColumnQuery';

export const parseFilterManually = (columns: ColumnInterface[], filter) => {
  const isWhereOperation = (value: string) => ['AND', 'OR'].includes(value);

  const getPrismaParsingType = (column: ColumnInterface, isArray: boolean = false) => {
    if (!column?.parsing) {
      return Prisma.empty;
    }
    if (isArray) {
      return Prisma.sql`${column.parsing}[]`;
    }
    return column.parsing;
  };
  const operationToSql = (operation: Record<string, any> | null, column?: ColumnInterface) => {
    if (operation === null) return Prisma.sql`IS NULL`;

    const [key, value] = Object.entries(operation)[0];
    const modeOperator = operation['mode'] === 'insensitive' ? Prisma.sql`ILIKE` : Prisma.sql`LIKE`;

    switch (key) {
      case 'not':
        return Prisma.sql`NOT ${operationToSql(value, column)}`;
      case 'contains':
        return Prisma.sql`${modeOperator} ${`%${value}%`}`;
      case 'eq':
        return Prisma.sql`= ${value}${getPrismaParsingType(column)}`;
      case 'ne':
        return Prisma.sql`!= ${value}${getPrismaParsingType(column)}`;
      case 'startsWith':
        return Prisma.sql`${modeOperator} ${`${value}%`}${getPrismaParsingType(column)}`;
      case 'endsWith':
        return Prisma.sql`${modeOperator} ${`%${value}`}${getPrismaParsingType(column)}`;
      case 'in':
        return Prisma.sql`= ANY(ARRAY[${Prisma.join(value)}]${getPrismaParsingType(column, true)})`;
      case 'gt':
        return Prisma.sql`> ${value}${getPrismaParsingType(column)}`;
      case 'gte':
        return Prisma.sql`>= ${value}${getPrismaParsingType(column)}`;
      case 'lt':
        return Prisma.sql`< ${value}${getPrismaParsingType(column)}`;
      case 'lte':
        return Prisma.sql`<= ${value}${getPrismaParsingType(column)}`;
      // TODO: In Range
      case 'inRange':
      // return { gte: from, lte: to };
      default:
        return Prisma.empty;
    }
  };

  const parsingFilter = (filter: Record<string, any>) => {
    const [key, value] = Object.entries(filter)[0];
    if (isWhereOperation(key)) {
      return Prisma.sql`(${Prisma.join(value.map(parsingFilter), ` ${key} `)})`;
    } else {
      const column = getColumnQuery(key, columns);
      return Prisma.sql`${column.sql} ${operationToSql(value, column)}`;
    }
  };

  const { organizationId, vendorId, ...query } = filter || {};
  const entityFilter = organizationId
    ? Prisma.sql`${getColumnQuery('entry.organizationId', columns).sql} = ${organizationId}`
    : vendorId
      ? Prisma.sql`${getColumnQuery('entry_items.payableId', columns).sql} = ${vendorId}`
      : Prisma.empty;
  const extraFilter = Object.keys(query).length
    ? Prisma.sql`AND ${parsingFilter(query)}`
    : Prisma.empty;

  return filter ? Prisma.sql`WHERE ${entityFilter} ${extraFilter}` : Prisma.empty;
};
