import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getTrip, getTripMembers } from '@/lib/trips'
import { getExpenses, getTotalExpenses } from '@/lib/expenses'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import { Trip, Expense, TripMember } from '@/types'
import { formatDate, formatCurrency } from '@/lib/format'

interface TripDetailProps {
  tripId: string
  onBack: () => void
  onShareTrip: () => void
  onAddExpense: () => void
  onEditExpense: (expenseId: string) => void
}

export function TripDetail({
  tripId,
  onBack,
  onShareTrip,
  onAddExpense,
  onEditExpense,
}: TripDetailProps) {
  const { user } = useAuth()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [members, setMembers] = useState<TripMember[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    void loadData()
  }, [tripId])

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [tripData, expenseData, memberData, total] = await Promise.all([
        getTrip(tripId),
        getExpenses(tripId),
        getTripMembers(tripId),
        getTotalExpenses(tripId),
      ])

      setTrip(tripData)
      setExpenses(expenseData)
      setMembers(memberData)
      setTotalAmount(total)
      setIsOwner(user?.id === tripData.user_id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load trip')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <div style={pageStyle}>
          <Card>
            <p>Loading trip...</p>
          </Card>
        </div>
      </Container>
    )
  }

  if (!trip) {
    return (
      <Container>
        <div style={pageStyle}>
          <Card>
            <p>Trip not found</p>
            <Button onClick={onBack} variant="secondary">
              Go Back
            </Button>
          </Card>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div style={{ padding: '2rem 0' }}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>{trip.destination}</h1>
            <p style={{ margin: '.5rem 0 0', color: '#6b7280' }}>
              {formatDate(trip.start_date)} to {formatDate(trip.end_date)}
            </p>
            {trip.status === 'cancelled' && (
              <div style={{ ...statusBadgeStyle, background: '#fee2e2', color: '#991b1b' }}>
                Cancelled
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
            {isOwner && (
              <Button onClick={onShareTrip} variant="secondary">
                Share Trip
              </Button>
            )}
            <Button onClick={onBack} variant="secondary">
              Back
            </Button>
          </div>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <Card>
          <div style={summaryStyle}>
            <div style={summaryItemStyle}>
              <span style={{ color: '#6b7280' }}>Total expenses</span>
              <strong style={{ fontSize: '1.5rem' }}>
                {formatCurrency(totalAmount, trip.currency)}
              </strong>
            </div>
            <div style={summaryItemStyle}>
              <span style={{ color: '#6b7280' }}>Expenses</span>
              <strong style={{ fontSize: '1.5rem' }}>{expenses.length}</strong>
            </div>
            <div style={summaryItemStyle}>
              <span style={{ color: '#6b7280' }}>Members</span>
              <strong style={{ fontSize: '1.5rem' }}>{members.length}</strong>
            </div>
          </div>
        </Card>

        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Expenses</h2>
            {trip.status === 'active' && (
              <Button onClick={onAddExpense}>Add Expense</Button>
            )}
          </div>

          {expenses.length === 0 ? (
            <Card>
              <p style={{ margin: 0, color: '#6b7280' }}>No expenses yet</p>
            </Card>
          ) : (
            <div style={expenseListStyle}>
              {expenses.map((expense) => (
                <Card key={expense.id} style={expenseCardStyle} onClick={() => onEditExpense(expense.id)}>
                  <div style={expenseHeaderStyle}>
                    <div>
                      <strong>{expense.category}</strong>
                      <p style={{ margin: '.25rem 0 0', color: '#6b7280', fontSize: '.875rem' }}>
                        {expense.description || 'No description'}
                      </p>
                    </div>
                    <strong style={{ fontSize: '1.125rem' }}>
                      {formatCurrency(expense.amount, trip.currency)}
                    </strong>
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '.875rem', marginTop: '.5rem' }}>
                    {formatDate(expense.expense_date)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

const pageStyle: React.CSSProperties = {
  padding: '2rem 0',
  minHeight: '100vh',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '2rem',
  marginBottom: '2rem',
}

const statusBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '.25rem .75rem',
  borderRadius: 4,
  fontSize: '.875rem',
  marginTop: '.5rem',
}

const summaryStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '2rem',
}

const summaryItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '.5rem',
}

const errorStyle: React.CSSProperties = {
  padding: '.75rem',
  background: '#fee2e2',
  border: '1px solid #fca5a5',
  borderRadius: 6,
  color: '#991b1b',
  marginBottom: '1rem',
}

const expenseListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '.75rem',
}

const expenseCardStyle: React.CSSProperties = {
  cursor: 'pointer',
  transition: 'all 0.2s ease',
}

const expenseHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '1rem',
}
