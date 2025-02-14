-- This is an empty migration.

UPDATE members
SET "allowState" = CASE
    WHEN "status" = true Then 'APPROVED'::"MemberState"
    WHEN "status" = false Then 'PENDING'::"MemberState"
    ELSE 'NONE'::"MemberState"
  END;