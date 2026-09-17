import { supabase } from './auth'

export async function getExpense(id: string) {
  const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single()

  if (error) throw error
  return data
}
