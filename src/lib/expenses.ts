import { supabase } from './auth'
import { Expense } from '@/types'

export async function getExpense(id: string): Promise<Expense> {
  const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single()

  if (error) throw error
  return data
}
