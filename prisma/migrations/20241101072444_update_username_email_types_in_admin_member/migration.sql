/*
  Warnings:

  - Changed the type of `username` on the `admins` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- AlterTable
ALTER TABLE admins
  ALTER COLUMN username TYPE CITEXT,
  ALTER COLUMN email TYPE CITEXT;

ALTER TABLE members
  ALTER COLUMN username TYPE CITEXT,
  ALTER COLUMN email TYPE CITEXT;
