import { supabase } from './auth'
import { Trip } from '@/types'

export async function getTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Trip[]
}

export async function getTrip(id: string): Promise<Trip> {
  const { data, error } = await supabase.from('trips').select('*').eq('id', id).single()

  if (error) throw error
  return data as Trip
}

export async function createTrip(
  trip: Omit<Trip, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('You must be signed in to create a trip')

  const { data, error } = await supabase
    .from('trips')
    .insert({ ...trip, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return (data as Trip).id
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
