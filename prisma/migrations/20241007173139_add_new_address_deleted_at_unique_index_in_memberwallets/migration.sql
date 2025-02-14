-- This is an empty migration.
CREATE UNIQUE INDEX unique_index_address_on_memberwallets
ON memberwallets (address)
WHERE "deletedAt" IS NULL;
