-- This is an empty migration.
CREATE UNIQUE INDEX unique_index_assetID_on_members
ON members ("assetId")
WHERE "status" = true;
