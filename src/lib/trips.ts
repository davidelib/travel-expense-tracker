import { supabase } from './auth'
import { Trip, TripInvitation, TripMember } from '@/types'

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
  trip: Omit<Trip, 'id' | 'user_id' | 'status' | 'cancelled_at' | 'cancelled_by' | 'created_at' | 'updated_at'>
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('You must be signed in to create a trip')

  const { data, error } = await supabase
    .from('trips')
    .insert({ ...trip, user_id: user.id, status: 'active' })
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

export async function cancelTrip(id: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('You must be signed in to cancel a trip')

  const { error } = await supabase
    .from('trips')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancelled_by: user.id })
    .eq('id', id)

  if (error) throw error
}

export async function getTripMembers(tripId: string): Promise<TripMember[]> {
  const { data, error } = await supabase.from('trip_members').select('*').eq('trip_id', tripId)
  if (error) throw error
  return (data ?? []) as TripMember[]
}

export async function getTripInvitations(tripId: string): Promise<TripInvitation[]> {
  const { data, error } = await supabase.from('trip_invitations').select('*').eq('trip_id', tripId)
  if (error) throw error
  return (data ?? []) as TripInvitation[]
}

export async function inviteTripMember(tripId: string, email: string) {
  const { data, error } = await supabase.functions.invoke('invite-trip-member', {
    body: { tripId, email },
  })

  if (error) throw error
  return data
}
