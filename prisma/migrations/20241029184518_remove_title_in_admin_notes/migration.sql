/*
  Warnings:

  - You are about to drop the column `title` on the `adminnotes` table. All the data in the column will be lost.
  - Made the column `description` on table `adminnotes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "adminnotes" DROP COLUMN "title",
ALTER COLUMN "description" SET NOT NULL;
