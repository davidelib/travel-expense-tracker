import { supabase } from './supabase'
import { Category } from '@/types'

const DEFAULT_CATEGORIES = [
  'Accommodation',
  'Food',
  'Transport',
  'Activities',
  'Shopping',
  'Drinks',
  'Flights',
  'Taxi & Rideshare',
  'Cash Withdrawals',
  'Bank & Transaction Fees',
  'SIM Card',
  'Other',
]

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data || DEFAULT_CATEGORIES.map((name) => ({ id: name, name }))
}

export function getDefaultCategories(): string[] {
  return DEFAULT_CATEGORIES
}
