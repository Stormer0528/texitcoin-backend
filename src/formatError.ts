import { Prisma } from '@prisma/client';
import { unwrapResolverError } from '@apollo/server/errors';
import type { GraphQLFormattedError } from 'graphql';
import { foreignKeyErrors, uniqueErrors } from './consts/errors';
import { ArgumentValidationError } from 'type-graphql';
import path from 'path';

const checkUniqueError = (
  meta: Record<string, unknown>,
  message: string
): GraphQLFormattedError => {
  const { modelName, target } = meta;
  const sortedTarget = (target as string[]).sort();
  const error = uniqueErrors.find((err) => {
    return (
      err.modelName === modelName &&
      JSON.stringify(err.path.sort()) === JSON.stringify(sortedTarget)
    );
  });
  return error
    ? {
        message: error.message,
        path: error.path,
      }
    : {
        message,
      };
};

const checkForeignKeyError = (
  meta: Record<string, unknown>,
  message: string
): GraphQLFormattedError => {
  const { field_name: fieldName } = meta;
  const slicedFieldName = (fieldName as string).slice(0, -8);
  const error = foreignKeyErrors.find((err) => {
    return err.constraintName === slicedFieldName;
  });
  return error
    ? {
        message: error.message,
        path: error.path,
      }
    : {
        message,
      };
};

export const formatError = (formattedError: GraphQLFormattedError, error: unknown) => {
  const originalError = unwrapResolverError(error);
  if (originalError instanceof Prisma.PrismaClientKnownRequestError) {
    if (originalError.code === 'P2002') {
      return checkUniqueError(originalError.meta, formattedError.message);
    } else if (originalError.code === 'P2003') {
      return checkForeignKeyError(originalError.meta, formattedError.message);
    }
  } else if (originalError instanceof ArgumentValidationError) {
    return {
      code: originalError.extensions.code,
      message: `${originalError.message}\n${originalError.extensions.validationErrors
        .flatMap((vadError) => Object.values(vadError.constraints))
        .join(',')}`,
      path: originalError.extensions.validationErrors.map((vadError) => vadError.property),
    };
  }
  return {
    message: formattedError.message,
    path: (formattedError.extensions.path ?? []) as any[],
  };
};
