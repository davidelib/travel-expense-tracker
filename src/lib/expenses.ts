import { supabase } from './supabase'
import { Expense, ExpenseByCategory } from '@/types'

export async function getExpenses(tripId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createExpense(expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Expense> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('expenses')
    .insert([{ ...expense, user_id: userData.user.id }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getExpensesByCategory(tripId: string): Promise<ExpenseByCategory[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('category, amount')
    .eq('trip_id', tripId)

  if (error) throw error

  const categoryMap = new Map<string, { total: number; count: number }>()

  data?.forEach((expense) => {
    const current = categoryMap.get(expense.category) || { total: 0, count: 0 }
    categoryMap.set(expense.category, {
      total: current.total + expense.amount,
      count: current.count + 1,
    })
  })

  return Array.from(categoryMap.entries()).map(([category, { total, count }]) => ({
    category,
    total,
    count,
  }))
}

export async function getTotalExpenses(tripId: string): Promise<number> {
  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('trip_id', tripId)

  if (error) throw error

  return data?.reduce((sum, expense) => sum + expense.amount, 0) || 0
}
