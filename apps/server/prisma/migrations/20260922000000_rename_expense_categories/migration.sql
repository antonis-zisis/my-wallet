UPDATE "transactions"
SET "category" = 'Household'
WHERE "category" = 'Rent' AND "type" = 'EXPENSE';

UPDATE "transactions"
SET "category" = 'Dining & Takeaway'
WHERE "category" = 'Dining Out' AND "type" = 'EXPENSE';

-- Insurance is retired with no successor: a policy can be health, home or car,
-- so there is no safe target and these rows fall back to Other for manual re-filing.
UPDATE "transactions"
SET "category" = 'Other'
WHERE "category" = 'Insurance' AND "type" = 'EXPENSE';
