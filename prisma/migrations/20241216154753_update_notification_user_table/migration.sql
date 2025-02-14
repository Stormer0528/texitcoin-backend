/*
  Warnings:

  - You are about to drop the `notificationmembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "notificationmembers" DROP CONSTRAINT "notificationmembers_memberId_fkey";

-- DropForeignKey
ALTER TABLE "notificationmembers" DROP CONSTRAINT "notificationmembers_notificationId_fkey";

-- DropTable
DROP TABLE "notificationmembers";

-- CreateTable
CREATE TABLE "notificationclients" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientType" "UserRole" NOT NULL,
    "notificationId" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "notificationclients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_index_on_notification_clients" ON "notificationclients"("clientId", "clientType", "notificationId");

-- AddForeignKey
ALTER TABLE "notificationclients" ADD CONSTRAINT "notificationclients_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
