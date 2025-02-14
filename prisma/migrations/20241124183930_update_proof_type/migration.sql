/*
  Warnings:

  - The values [MINE,SALARY] on the enum `ProofType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NewProofType" AS ENUM (
    'COMMISSION',
    'MINENEWEQUIPMENT',
    'MINEELECTRICITY',
    'MINEMAINTAINANCE',
    'MINEFACILITYRENTMORTAGE',
    'MARKETINGTXCPROMOTION',
    'MARKETINGMINETXCPROMOTION',
    'INFRASTRUCTURE',
    'OVERHEAD',
    'ADMINISTRATIONSALARY',
    'PROMOTION',
    'PROFIT',
    'SALE',
    'PREPAY'
);

ALTER TABLE proofs
ALTER COLUMN type TYPE Text;

UPDATE proofs SET type='ADMINISTRATIONSALARY' WHERE type='SALARY';


ALTER TABLE proofs
ALTER COLUMN type TYPE "NewProofType" USING type::text::"NewProofType";

DROP TYPE "ProofType";

ALTER TYPE "NewProofType" RENAME TO "ProofType";

COMMIT;
