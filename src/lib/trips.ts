import { supabase } from './auth'
import { Trip, TripInvitation, TripMember } from '@/types'

export async function getTrips(): Promise<Trip[]> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('You must be signed in to view trips')

  const [ownerTripsResult, memberTripsResult] = await Promise.all([
    supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('trip_members')
      .select('trip_id')
      .eq('user_id', user.id),
  ])

  if (ownerTripsResult.error) throw ownerTripsResult.error
  if (memberTripsResult.error) throw memberTripsResult.error

  const memberTripIds = [...new Set((memberTripsResult.data ?? []).map((row) => row.trip_id))]
  const ownedTrips = (ownerTripsResult.data ?? []) as Trip[]

  if (!memberTripIds.length) {
    return ownedTrips
  }

  const { data: sharedTrips, error: sharedTripsError } = await supabase
    .from('trips')
    .select('*')
    .in('id', memberTripIds)
    .order('created_at', { ascending: false })

  if (sharedTripsError) throw sharedTripsError

  const allTrips = [...ownedTrips, ...(sharedTrips ?? [])]
  const uniqueTrips = new Map<string, Trip>()

  for (const trip of allTrips) {
    uniqueTrips.set(trip.id, trip)
  }

  return [...uniqueTrips.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
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

export async function reActivateTrip(id: string) {
  const { error } = await supabase
    .from('trips')
    .update({ status: 'active', cancelled_at: null, cancelled_by: null })
    .eq('id', id)

  if (error) throw error
}

export async function getTripMembers(tripId: string): Promise<TripMember[]> {
  const { data, error } = await supabase
    .from('trip_members')
    .select('*')
    .eq('trip_id', tripId)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as TripMember[]
}

export async function getTripInvitations(tripId: string): Promise<TripInvitation[]> {
  const { data, error } = await supabase
    .from('trip_invitations')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })

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

export async function acceptTripInvitation(token: string) {
  const { data, error } = await supabase.functions.invoke('accept-trip-invite', {
    body: { token },
  })

  if (error) throw error
  return data
}
