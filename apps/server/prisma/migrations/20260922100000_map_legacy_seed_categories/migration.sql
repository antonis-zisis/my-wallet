-- Food, Housing and Travel predate the current category list and were only ever
-- written by the seed script, so no user could have chosen them from the picker.
UPDATE "transactions"
SET "category" = 'Groceries'
WHERE "category" = 'Food' AND "type" = 'EXPENSE';

UPDATE "transactions"
SET "category" = 'Household'
WHERE "category" = 'Housing' AND "type" = 'EXPENSE';

UPDATE "transactions"
SET "category" = 'Transport'
WHERE "category" = 'Travel' AND "type" = 'EXPENSE';
