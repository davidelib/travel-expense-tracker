import { supabase } from './auth'
import { Expense } from '@/types'

type NewExpense = Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>

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

export async function createExpenses(expenses: NewExpense[]): Promise<Expense[]> {
  if (!expenses.length) return []

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('You must be signed in to add an expense')

  const { data, error } = await supabase
    .from('expenses')
    .insert(expenses.map((expense) => ({ ...expense, user_id: user.id })))
    .select()

  if (error) throw error
  return (data ?? []) as Expense[]
}

export async function createExpense(expense: NewExpense): Promise<Expense> {
  const [createdExpense] = await createExpenses([expense])
  if (!createdExpense) throw new Error('Expense could not be created')
  return createdExpense
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
