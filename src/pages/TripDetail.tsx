import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/auth'
import { getTrip, getTripMembers, deleteTrip } from '@/lib/trips'
import { getExpenses, getTotalExpenses } from '@/lib/expenses'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import { Trip, Expense, TripMember } from '@/types'
import { formatDate, formatCurrency } from '@/lib/format'

interface TripDetailProps {
  tripId: string
  onBack: () => void
  onDeleted: () => void
  onShareTrip: () => void
  onAddExpense: () => void
  onEditExpense: (expenseId: string) => void
}

type ExpenseSortField = 'expense_date' | 'amount' | 'category' | 'description' | 'created_at' | 'updated_at'
type SortDirection = 'ascending' | 'descending'

const expenseSortOptions: Array<{ value: ExpenseSortField; label: string }> = [
  { value: 'expense_date', label: 'Expense date' },
  { value: 'amount', label: 'Amount' },
  { value: 'category', label: 'Category' },
  { value: 'description', label: 'Description' },
  { value: 'created_at', label: 'Created' },
  { value: 'updated_at', label: 'Last updated' },
]

export function TripDetail({ tripId, onBack, onDeleted, onShareTrip, onAddExpense, onEditExpense }: TripDetailProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [members, setMembers] = useState<TripMember[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [sortField, setSortField] = useState<ExpenseSortField>('expense_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('descending')

  const sortedExpenses = useMemo(() => {
    const direction = sortDirection === 'ascending' ? 1 : -1

    return [...expenses].sort((first, second) => {
      const firstValue = sortField === 'amount' ? first.amount : first[sortField] ?? ''
      const secondValue = sortField === 'amount' ? second.amount : second[sortField] ?? ''
      const comparison = typeof firstValue === 'number' && typeof secondValue === 'number'
        ? firstValue - secondValue
        : String(firstValue).localeCompare(String(secondValue))

      return comparison === 0 ? first.id.localeCompare(second.id) : comparison * direction
    })
  }, [expenses, sortDirection, sortField])

  const expenseGroups = useMemo(() => {
    const groups = new Map<string, Expense[]>()
    for (const expense of sortedExpenses) {
      const dayExpenses = groups.get(expense.expense_date) ?? []
      dayExpenses.push(expense)
      groups.set(expense.expense_date, dayExpenses)
    }

    const dateDirection = sortField === 'expense_date' && sortDirection === 'ascending' ? 1 : -1
    return [...groups.entries()].sort(([firstDate], [secondDate]) => (
      firstDate.localeCompare(secondDate) * dateDirection
    ))
  }, [sortDirection, sortField, sortedExpenses])

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setError('')

      try {
        const [tripData, expenseData, memberData, total, userResult] = await Promise.all([
          getTrip(tripId),
          getExpenses(tripId),
          getTripMembers(tripId),
          getTotalExpenses(tripId),
          supabase.auth.getUser(),
        ])

        if (cancelled) return
        setTrip(tripData)
        setExpenses(expenseData)
        setMembers(memberData)
        setTotalAmount(total)
        setIsOwner(userResult.data.user?.id === tripData.user_id)
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load trip')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadData()
    return () => { cancelled = true }
  }, [tripId])

  const handleDelete = async () => {
    if (!trip || !isOwner || deleting) return

    const confirmed = window.confirm(
      `Delete the trip to ${trip.destination}? This will permanently delete its expenses, members, and invitations. This action cannot be undone.`,
    )
    if (!confirmed) return

    setDeleting(true)
    setError('')
    try {
      await deleteTrip(trip.id)
      onDeleted()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete trip')
      setDeleting(false)
    }
  }

  const handleSort = (field: ExpenseSortField) => {
    if (field === sortField) {
      setSortDirection((currentDirection) => currentDirection === 'ascending' ? 'descending' : 'ascending')
      return
    }

    setSortField(field)
  }

  if (loading) {
    return <Container><div style={pageStyle}><Card><p>Loading trip...</p></Card></div></Container>
  }

  if (!trip) {
    return <Container><div style={pageStyle}><Card><p>Trip not found</p><Button onClick={onBack} variant="secondary">Go Back</Button></Card></div></Container>
  }

  return (
    <Container>
      <div style={pageStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>{trip.destination}</h1>
            <p style={{ margin: '.5rem 0 0', color: '#6b7280' }}>
              {formatDate(trip.start_date)} to {formatDate(trip.end_date)}
            </p>
            {trip.status === 'cancelled' && <div style={cancelledStyle}>Cancelled</div>}
          </div>
          <div style={actionsStyle}>
            {isOwner && <Button onClick={handleDelete} variant="danger" loading={deleting}>Delete Trip</Button>}
            <Button onClick={onShareTrip} variant="secondary">Share Trip</Button>
            <Button onClick={onBack} variant="secondary">Back</Button>
          </div>
        </div>

        {!isOwner && <p style={ownerNoteStyle}>You can view this trip, but only its owner can send invitations or delete it.</p>}
        {error && <div style={errorStyle}>{error}</div>}

        <Card>
          <div style={summaryStyle}>
            <div><span style={mutedStyle}>Total expenses</span><strong style={valueStyle}>{formatCurrency(totalAmount, trip.currency)}</strong></div>
            <div><span style={mutedStyle}>Expenses</span><strong style={valueStyle}>{expenses.length}</strong></div>
            <div><span style={mutedStyle}>Members</span><strong style={valueStyle}>{members.length}</strong></div>
          </div>
        </Card>

        <div style={{ marginTop: '2rem' }}>
          <div style={sectionHeaderStyle}>
            <h2 style={{ margin: 0 }}>Expenses</h2>
            <div style={sectionControlsStyle}>
              <div style={sortControlsStyle}>
                <span style={sortLabelStyle}>Sort by:</span>
                {expenseSortOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={sortField === option.value ? 'primary' : 'secondary'}
                    onClick={() => handleSort(option.value)}
                  >
                    {option.label}{sortField === option.value ? ` (${sortDirection === 'ascending' ? 'ASC' : 'DESC'})` : ''}
                  </Button>
                ))}
              </div>
              {trip.status === 'active' && <Button onClick={onAddExpense}>Add Expense</Button>}
            </div>
          </div>
          {expenses.length === 0 ? <Card><p style={mutedStyle}>No expenses yet</p></Card> : (
            <div style={dayGroupsStyle}>
              {expenseGroups.map(([date, dayExpenses]) => (
                <section key={date}>
                  <h3 style={dayHeadingStyle}>{formatDate(date)}</h3>
                  <div style={listStyle}>
                    {dayExpenses.map((expense) => (
                      <div key={expense.id} onClick={() => onEditExpense(expense.id)} style={expenseWrapperStyle}>
                        <Card>
                          <div style={expenseHeaderStyle}>
                            <div><strong>{expense.category}</strong><p style={descriptionStyle}>{expense.description || 'No description'}</p></div>
                            <strong>{formatCurrency(expense.amount, trip.currency)}</strong>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

const pageStyle: React.CSSProperties = { padding: '2rem 0', minHeight: '100vh' }
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }
const actionsStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.5rem', justifyContent: 'flex-end' }
const sectionHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }
const sectionControlsStyle: React.CSSProperties = { display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }
const sortControlsStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }
const sortLabelStyle: React.CSSProperties = { fontSize: '.875rem', fontWeight: 500 }
const summaryStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }
const valueStyle: React.CSSProperties = { display: 'block', fontSize: '1.5rem', marginTop: '.35rem' }
const mutedStyle: React.CSSProperties = { color: '#6b7280', fontSize: '.875rem' }
const descriptionStyle: React.CSSProperties = { margin: '.25rem 0 0', color: '#6b7280', fontSize: '.875rem' }
const dayGroupsStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5rem' }
const dayHeadingStyle: React.CSSProperties = { margin: '0 0 .75rem', color: '#374151', fontSize: '1rem' }
const listStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '.75rem' }
const expenseWrapperStyle: React.CSSProperties = { cursor: 'pointer' }
const expenseHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }
const cancelledStyle: React.CSSProperties = { display: 'inline-block', marginTop: '.5rem', padding: '.25rem .75rem', borderRadius: 4, background: '#fee2e2', color: '#991b1b', fontSize: '.875rem' }
const ownerNoteStyle: React.CSSProperties = { margin: '0 0 1rem', color: '#6b7280', fontSize: '.875rem' }
const errorStyle: React.CSSProperties = { padding: '.75rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', marginBottom: '1rem' }
