import { useState, useEffect } from 'react'
import { getTrip, getTripMembers, getTripInvitations } from '@/lib/trips'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import { Trip, TripInvitation, TripMember } from '@/types'
import { formatDate } from '@/lib/format'

interface ShareTripProps {
  tripId: string
  onBack: () => void
}

export function ShareTrip({ tripId, onBack }: ShareTripProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [members, setMembers] = useState<TripMember[]>([])
  const [invitations, setInvitations] = useState<TripInvitation[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    void loadData()
  }, [tripId])

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [tripData, memberData, invitationData] = await Promise.all([
        getTrip(tripId),
        getTripMembers(tripId),
        getTripInvitations(tripId),
      ])

      setTrip(tripData)
      setMembers(memberData)
      setInvitations(invitationData)

      const { data: userData } = await supabase.auth.getUser()
      setIsOwner(userData?.user?.id === tripData.user_id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load trip sharing details')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Email is required')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Enter a valid email address')
      return
    }

    setSubmitting(true)
    try {
      await inviteTripMember(tripId, trimmedEmail)
      setMessage('Invitation sent successfully')
      setEmail('')
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <div style={pageStyle}><Card><p>Loading trip sharing...</p></Card></div>
      </Container>
    )
  }

  if (!trip) {
    return (
      <Container>
        <div style={pageStyle}><Card><p>Trip not found</p><Button onClick={onBack} variant="secondary">Go Back</Button></Card></div>
      </Container>
    )
  }

  return (
    <Container>
      <div style={{ padding: '2rem 0' }}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>Share {trip.destination}</h1>
            <p style={{ margin: '.5rem 0 0', color: '#6b7280' }}>Manage invited collaborators for this trip.</p>
          </div>
          <Button variant="secondary" onClick={onBack}>Back</Button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        {message && <div style={successStyle}>{message}</div>}

        {isOwner ? (
          <Card>
            <form onSubmit={handleInvite} style={formStyle}>
              <Input
                label="Invite by email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
              />
              <Button type="submit" loading={submitting} fullWidth>Send Invitation</Button>
            </form>
          </Card>
        ) : (
          <Card>
            <p style={{ margin: 0 }}>Only the trip owner can invite members.</p>
          </Card>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Card>
            <h2 style={{ marginTop: 0 }}>Members</h2>
            {members.length === 0 ? <p>No members yet.</p> : (
              <div style={listStyle}>
                {members.map((member) => (
                  <div key={member.id} style={rowStyle}>
                    <div>
                      <strong>{member.user_id}</strong>
                      <div style={{ color: '#6b7280', fontSize: '.875rem' }}>{member.role}</div>
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '.875rem' }}>{formatDate(member.joined_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Card>
            <h2 style={{ marginTop: 0 }}>Pending invitations</h2>
            {invitations.length === 0 ? <p>No pending invitations.</p> : (
              <div style={listStyle}>
                {invitations.map((invitation) => (
                  <div key={invitation.id} style={rowStyle}>
                    <div>
                      <strong>{invitation.invited_email}</strong>
                      <div style={{ color: '#6b7280', fontSize: '.875rem' }}>{invitation.status}</div>
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '.875rem' }}>{formatDate(invitation.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Container>
  )
}

const pageStyle: React.CSSProperties = { padding: '2rem 0', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' }
const listStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '.75rem' }
const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '.75rem', background: '#f9fafb', borderRadius: 6 }
const errorStyle: React.CSSProperties = { padding: '.75rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', marginBottom: '1rem' }
const successStyle: React.CSSProperties = { padding: '.75rem', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 6, color: '#166534', marginBottom: '1rem' }
