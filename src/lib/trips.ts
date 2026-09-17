import { supabase } from './supabase'
import { Trip } from '@/types'

export async function getTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getTrip(id: string): Promise<Trip> {
  const { data, error } = await supabase.from('trips').select('*').eq('id', id).single()

  if (error) throw error
  return data
}

export async function createTrip(trip: Omit<Trip, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('trips').insert([trip]).select().single()

  if (error) throw error
  return data.id
}

export async function updateTrip(
  id: string,
  updates: Partial<Omit<Trip, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
) {
  const { error } = await supabase.from('trips').update(updates).eq('id', id)

  if (error) throw error
}

export async function deleteTrip(id: string) {
  const { error } = await supabase.from('trips').delete().eq('id', id)

  if (error) throw error
}
