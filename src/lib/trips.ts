import { supabase } from './supabase'
import { Trip } from '@/types'

export async function createTrip(trip: Omit<Trip, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('travel_expenses.trips')
    .insert([trip])
    .select()
    .single()

  if (error) throw error
  return data.id
}

export async function getTrips() {
  const { data, error } = await supabase
    .from('travel_expenses.trips')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Trip[]
}

export async function getTrip(id: string) {
  const { data, error } = await supabase
    .from('travel_expenses.trips')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Trip
}

export async function updateTrip(id: string, trip: Partial<Trip>) {
  const { data, error } = await supabase
    .from('travel_expenses.trips')
    .update(trip)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTrip(id: string) {
  const { error } = await supabase.from('travel_expenses.trips').delete().eq('id', id)

  if (error) throw error
}
