export interface Trip {
  id: string
  user_id: string
  destination: string
  start_date: string
  end_date: string
  currency: string
  status: 'active' | 'cancelled'
  cancelled_at: string | null
  cancelled_by: string | null
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  trip_id: string
  user_id: string
  amount: number
  category: string
  description: string | null
  expense_date: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
}

export interface TripMember {
  id: string
  trip_id: string
  user_id: string
  role: 'owner' | 'editor'
  joined_at: string
}

export interface TripInvitation {
  id: string
  trip_id: string
  invited_email: string
  token: string
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  invited_by: string
  accepted_by: string | null
  expires_at: string
  created_at: string
}
