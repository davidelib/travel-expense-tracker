-- Create travel_expenses schema first (isolated from other projects)
CREATE SCHEMA IF NOT EXISTS travel_expenses;

-- Create categories table
CREATE TABLE IF NOT EXISTS travel_expenses.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trips table
CREATE TABLE IF NOT EXISTS travel_expenses.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS travel_expenses.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES travel_expenses.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add constraint to ensure expenses belong to user's trips
ALTER TABLE travel_expenses.expenses
ADD CONSTRAINT expenses_trip_user_consistency
CHECK (user_id IN (SELECT user_id FROM travel_expenses.trips WHERE id = trip_id));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON travel_expenses.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_start_date ON travel_expenses.trips(start_date);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON travel_expenses.expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON travel_expenses.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON travel_expenses.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON travel_expenses.expenses(category);

-- Enable Row Level Security on all tables
ALTER TABLE travel_expenses.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_expenses.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_expenses.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running migrations)
DROP POLICY IF EXISTS "Users can view their own trips" ON travel_expenses.trips;
DROP POLICY IF EXISTS "Users can insert their own trips" ON travel_expenses.trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON travel_expenses.trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON travel_expenses.trips;
DROP POLICY IF EXISTS "Users can view their own expenses" ON travel_expenses.expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON travel_expenses.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON travel_expenses.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON travel_expenses.expenses;
DROP POLICY IF EXISTS "Anyone can view categories" ON travel_expenses.categories;

-- Create RLS policies for trips table
CREATE POLICY "Users can view their own trips"
  ON travel_expenses.trips
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
  ON travel_expenses.trips
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
  ON travel_expenses.trips
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
  ON travel_expenses.trips
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for expenses table
CREATE POLICY "Users can view their own expenses"
  ON travel_expenses.expenses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON travel_expenses.expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON travel_expenses.expenses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON travel_expenses.expenses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policy for categories (public read-only)
CREATE POLICY "Anyone can view categories"
  ON travel_expenses.categories
  FOR SELECT
  USING (true);

-- Insert default categories (only if they don't exist)
INSERT INTO travel_expenses.categories (name) VALUES
  ('Accommodation'),
  ('Food'),
  ('Transport'),
  ('Activities'),
  ('Shopping'),
  ('Drinks'),
  ('Flights'),
  ('Taxi & Rideshare'),
  ('Cash Withdrawals'),
  ('Bank & Transaction Fees'),
  ('SIM Card'),
  ('Other')
ON CONFLICT (name) DO NOTHING;
