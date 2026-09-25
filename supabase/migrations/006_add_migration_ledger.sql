CREATE TABLE IF NOT EXISTS travel_expenses.schema_migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

DO $$
BEGIN
  IF to_regclass('travel_expenses.trips') IS NULL
    OR to_regclass('travel_expenses.expenses') IS NULL
    OR to_regclass('travel_expenses.categories') IS NULL
    OR to_regclass('travel_expenses.trip_members') IS NULL
    OR to_regclass('travel_expenses.trip_invitations') IS NULL THEN
    RAISE EXCEPTION 'Cannot establish migration baseline: required tables are missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'travel_expenses'
      AND table_name = 'trips'
      AND column_name = 'status'
  ) THEN
    RAISE EXCEPTION 'Cannot establish migration baseline: trips.status is missing';
  END IF;

  IF (
    SELECT count(*)
    FROM travel_expenses.categories
    WHERE name IN (
      'Flights',
      'Taxi & Rideshare',
      'Cash Withdrawals',
      'Bank & Transaction Fees',
      'SIM Card'
    )
  ) <> 5 THEN
    RAISE EXCEPTION 'Cannot establish migration baseline: migration 005 categories are missing';
  END IF;
END;
$$;

INSERT INTO travel_expenses.schema_migrations (version, name) VALUES
  ('001', 'create_travel_expenses_schema'),
  ('002', 'make_expense_description_optional'),
  ('003', 'shared_trip_support'),
  ('004', 'fix_trip_member_policy_recursion'),
  ('005', 'add_expense_categories'),
  ('006', 'add_migration_ledger')
ON CONFLICT (version) DO NOTHING;
