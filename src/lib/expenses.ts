import { supabase } from './supabase'
import { Expense, Category } from '@/types'

export async function createExpense(
  expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('travel_expenses.expenses')
    .insert([expense])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getExpenses(tripId: string) {
  const { data, error } = await supabase
    .from('travel_expenses.expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('expense_date', { ascending: false })

  if (error) throw error
  return data as Expense[]
}

export async function getExpense(id: string) {
  const { data, error } = await supabase
    .from('travel_expenses.expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Expense
}

export async function updateExpense(id: string, expense: Partial<Expense>) {
  const { data, error } = await supabase
    .from('travel_expenses.expenses')
    .update(expense)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('travel_expenses.expenses').delete().eq('id', id)

  if (error) throw error
}

export async function getTotalExpenses(tripId: string) {
  const { data, error } = await supabase
    .from('travel_expenses.expenses')
    .select('amount')
    .eq('trip_id', tripId)

  if (error) throw error

  return data.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0)
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('travel_expenses.categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data as Category[]
}
