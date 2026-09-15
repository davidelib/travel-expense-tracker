-- Create schema for travel expenses application
CREATE SCHEMA IF NOT EXISTS travel_expenses;

-- Create trips table
CREATE TABLE travel_expenses.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Create categories table
CREATE TABLE travel_expenses.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create expenses table
CREATE TABLE travel_expenses.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES travel_expenses.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL REFERENCES travel_expenses.categories(name),
  description VARCHAR(500) NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Create indexes for better query performance
CREATE INDEX trips_user_id_idx ON travel_expenses.trips(user_id);
CREATE INDEX trips_created_at_idx ON travel_expenses.trips(created_at);
CREATE INDEX expenses_trip_id_idx ON travel_expenses.expenses(trip_id);
CREATE INDEX expenses_user_id_idx ON travel_expenses.expenses(user_id);
CREATE INDEX expenses_expense_date_idx ON travel_expenses.expenses(expense_date);

-- Enable Row Level Security
ALTER TABLE travel_expenses.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_expenses.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_expenses.categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trips
CREATE POLICY trips_select ON travel_expenses.trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY trips_insert ON travel_expenses.trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY trips_update ON travel_expenses.trips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY trips_delete ON travel_expenses.trips FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for expenses
CREATE POLICY expenses_select ON travel_expenses.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY expenses_insert ON travel_expenses.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY expenses_update ON travel_expenses.expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY expenses_delete ON travel_expenses.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for categories (allow all authenticated users to read)
CREATE POLICY categories_select ON travel_expenses.categories FOR SELECT
  USING (true);

-- Insert default categories
INSERT INTO travel_expenses.categories (name) VALUES
  ('Accommodation'),
  ('Food & Dining'),
  ('Transportation'),
  ('Entertainment'),
  ('Shopping'),
  ('Activities'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION travel_expenses.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trips_updated_at_trigger BEFORE UPDATE ON travel_expenses.trips
  FOR EACH ROW EXECUTE FUNCTION travel_expenses.update_updated_at_column();

CREATE TRIGGER expenses_updated_at_trigger BEFORE UPDATE ON travel_expenses.expenses
  FOR EACH ROW EXECUTE FUNCTION travel_expenses.update_updated_at_column();
