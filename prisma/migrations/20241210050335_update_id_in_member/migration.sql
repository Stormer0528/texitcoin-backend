/*
  Warnings:

  - The `ID` column on the `members` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/

WITH ranked_data AS (
    SELECT
        id,
        "ID",
        "createdAt",
        ROW_NUMBER() OVER (ORDER BY "createdAt") AS seq_id
    FROM members
)
UPDATE members
SET "ID" = (
    SELECT
        CASE
            WHEN "ID" LIKE 'M-%' THEN SUBSTRING("ID" FROM 3) -- Extract the integer part from 'M-'
            ELSE (-seq_id)::Text --Max ID 596, Max row number 566--
        END
    FROM ranked_data
    WHERE members.id = ranked_data.id
);
UPDATE members
SET "ID" = NULL
WHERE status = false; 

-- AlterTable
ALTER TABLE members ALTER COLUMN "ID" TYPE INT USING "ID"::INTEGER;

CREATE SEQUENCE members_id_seq;
ALTER TABLE "members" ALTER COLUMN "ID" SET DEFAULT nextval('members_id_seq');
ALTER SEQUENCE members_id_seq OWNED BY "members"."ID";
