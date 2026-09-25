INSERT INTO travel_expenses.categories (name) VALUES
  ('Flights'),
  ('Taxi & Rideshare'),
  ('Cash Withdrawals'),
  ('Bank & Transaction Fees'),
  ('SIM Card')
ON CONFLICT (name) DO NOTHING;
