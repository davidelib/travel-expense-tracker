import { useState, useEffect } from 'react'
import { getTrips } from '@/lib/trips'
import { getExpenses } from '@/lib/expenses'
import { signOut, deleteAccount } from '@/lib/auth'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import { TripCard } from '@/components/TripCard'
import { Trip } from '@/types'

type TripSummary = Trip & {
  totalExpenses: number
  categoryTotals: Array<{ category: string; amount: number }>
}

interface HomeProps {
  onSelectTrip: (tripId: string) => void
  onCreateTrip: () => void
  onLogout: () => void
  onAccountDeleted: () => void
}

export function Home({ onSelectTrip, onCreateTrip, onLogout, onAccountDeleted }: HomeProps) {
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [accountError, setAccountError] = useState('')

  useEffect(() => {
    void loadTrips()
  }, [])

  const loadTrips = async () => {
    setLoading(true)
    try {
      const data = await getTrips()
      setTrips(await Promise.all(data.map(async (trip) => ({
        ...trip,
        ...summarizeExpenses(await getExpenses(trip.id)),
      }))))
    } catch (err) {
      console.error('Failed to load trips', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      onLogout()
    } catch (err) {
      console.error('Failed to logout', err)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete your account permanently? This will also delete all of your trips and expenses. This action cannot be undone.'
    )

    if (!confirmed) return

    setAccountError('')
    setDeletingAccount(true)

    try {
      await deleteAccount()
      onAccountDeleted()
    } catch (err: unknown) {
      setAccountError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setDeletingAccount(false)
    }
  }

  return (
    <Container>
      <div style={{ padding: '2rem 0' }}>
        <div style={headerStyle}>
          <h1>My Trips</h1>
          <div style={headerActionsStyle}>
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            <Button variant="danger" onClick={handleDeleteAccount} loading={deletingAccount}>
              Delete Account
            </Button>
          </div>
        </div>

        {accountError && <div style={errorStyle}>{accountError}</div>}

        <div style={{ marginBottom: '2rem' }}>
          <Button onClick={onCreateTrip} size="lg">Create New Trip</Button>
        </div>

        {loading ? (
          <Card><p>Loading trips...</p></Card>
        ) : trips.length === 0 ? (
          <Card><p>No trips yet. Create your first trip to get started!</p></Card>
        ) : (
          <div style={gridStyle}>
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                totalExpenses={trip.totalExpenses}
                categoryTotals={trip.categoryTotals}
                onClick={() => onSelectTrip(trip.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

function summarizeExpenses(expenses: Array<{ amount: number; category: string }>) {
  const categoryTotals = new Map<string, number>()
  let totalExpenses = 0

  for (const expense of expenses) {
    const amount = Number(expense.amount)
    totalExpenses += amount
    categoryTotals.set(expense.category, (categoryTotals.get(expense.category) ?? 0) + amount)
  }

  return {
    totalExpenses,
    categoryTotals: [...categoryTotals.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((first, second) => second.amount - first.amount),
  }
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '2rem',
}

const headerActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '.75rem',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1.5rem',
}

const errorStyle: React.CSSProperties = {
  padding: '.75rem',
  marginBottom: '1rem',
  background: '#fee2e2',
  border: '1px solid #fca5a5',
  borderRadius: 6,
  color: '#991b1b',
}
