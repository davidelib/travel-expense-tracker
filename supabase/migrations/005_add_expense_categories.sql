INSERT INTO travel_expenses.categories (name) VALUES
  ('Airfare'),
  ('Taxi & Rideshare'),
  ('Cash Withdrawals'),
  ('Bank & Transaction Fees')
ON CONFLICT (name) DO NOTHING;
