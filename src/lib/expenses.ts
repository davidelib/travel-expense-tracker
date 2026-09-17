import { supabase } from './auth'
import { Expense } from '@/types'

export async function getExpenses(tripId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('expense_date', { ascending: false })

  if (error) throw error
  return (data ?? []) as Expense[]
}

export async function getExpense(id: string): Promise<Expense> {
  const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single()

  if (error) throw error
  return data as Expense
}

export async function getTotalExpenses(tripId: string): Promise<number> {
  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('trip_id', tripId)

  if (error) throw error

  return (data ?? []).reduce(
    (sum: number, expense: { amount: number | string }) => sum + Number(expense.amount),
    0
  )
}

export async function createExpense(
  expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('You must be signed in to add an expense')

  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...expense, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data as Expense
}

export async function updateExpense(
  id: string,
  updates: Partial<Omit<Expense, 'id' | 'user_id' | 'trip_id' | 'created_at' | 'updated_at'>>
) {
  const { error } = await supabase.from('expenses').update(updates).eq('id', id)

  if (error) throw error
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) throw error
}
