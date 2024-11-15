/*
  Warnings:

  - The `status` column on the `weeklycommissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'PAID', 'DECLINED');

-- Remove default value if it exists
ALTER TABLE weeklycommissions ALTER COLUMN status DROP DEFAULT;
ALTER TABLE weeklycommissions ALTER COLUMN status TYPE VARCHAR;

-- Convert existing values to match the new enum type
UPDATE weeklycommissions
SET status = CASE
    WHEN status = 'NONE' THEN 'NONE'
    WHEN status = 'PENDING' THEN 'PENDING'
    WHEN status = 'CONFIRM' THEN 'PAID'
    WHEN status = 'BLOCK' THEN 'DECLINED'
    ELSE status
END;

-- Change column type to the new enum type
ALTER TABLE weeklycommissions
ALTER COLUMN status TYPE "ConfirmationStatus" USING status::"ConfirmationStatus";

-- Reapply the default value if required
ALTER TABLE weeklycommissions ALTER COLUMN status SET NOT NULL;
ALTER TABLE weeklycommissions ALTER COLUMN status SET DEFAULT 'NONE';

-- DropEnum
DROP TYPE "Confirmation4Status";
