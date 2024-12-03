import { ColumnInterface } from '@/type';

export const getColumnQuery = (column: string, columnList: ColumnInterface[]) => {
  const query = columnList.find((qry) => qry.column === column);
  if (query) {
    return query;
  }
  throw new Error(`Column ${column} not found in column list`);
};
