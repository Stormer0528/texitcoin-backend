UPDATE sales SET "ID" = -"ID";

WITH withSaleIDs AS (
    SELECT 
        "id", 
        ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS row_num
    FROM "sales"
)
UPDATE "sales"
SET "ID" = withSaleIDs.row_num
FROM withSaleIDs
WHERE "sales"."id" = withSaleIDs."id";


UPDATE members SET "ID" = -"ID";

WITH withMemberIDs AS (
    SELECT 
        "id", 
        ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS row_num
    FROM "members"
)
UPDATE "members"
SET "ID" = withMemberIDs.row_num
FROM withMemberIDs
WHERE "members"."id" = withMemberIDs."id";

DROP INDEX "index_weeklycommissions_on_ID";
CREATE UNIQUE INDEX "index_weeklycommissions_on_ID" ON "weeklycommissions"("ID") WHERE commission > 0 AND status != 'PREVIEW';

UPDATE weeklycommissions SET "ID" = -"ID";
UPDATE weeklycommissions SET "ID" = -1 WHERE commission <= 0 OR status = 'PREVIEW';

WITH withCommissionIDs AS (
    SELECT 
        "id", 
        ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS row_num
    FROM "weeklycommissions"
    WHERE commission > 0 AND status != 'PREVIEW'
)
UPDATE "weeklycommissions"
SET "ID" = withCommissionIDs.row_num
FROM withCommissionIDs
WHERE "weeklycommissions"."id" = withCommissionIDs."id";
