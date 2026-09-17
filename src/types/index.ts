export interface Trip {
  id: string
  user_id: string
  destination: string
  start_date: string
  end_date: string
  currency: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  trip_id: string
  user_id: string
  amount: number
  category: string
  description: string | null
  expense_date: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
}
