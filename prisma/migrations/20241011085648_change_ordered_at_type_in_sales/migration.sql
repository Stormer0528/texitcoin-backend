-- Step 1: Add a temporary column to hold the converted values
ALTER TABLE public.sales ADD COLUMN temp_timestamp timestamp(3) NOT NULL DEFAULT NOW();

-- Step 2: Update the temporary column with converted values
UPDATE public.sales
SET temp_timestamp = ("orderedAt" AT TIME ZONE 'UTC')::timestamp(3);

-- Step 3: Drop the original column
ALTER TABLE public.sales DROP COLUMN "orderedAt";

-- Step 4: Rename the temporary column to the original column name
ALTER TABLE public.sales RENAME COLUMN temp_timestamp TO "orderedAt";
