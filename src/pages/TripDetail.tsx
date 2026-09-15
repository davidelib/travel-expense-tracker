import { useState, useEffect } from 'react'
import { getTrip } from '@/lib/trips'
import { getExpenses } from '@/lib/expenses'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import { ExpenseItem } from '@/components/ExpenseItem'
import { formatCurrency, formatDateRange } from '@/lib/format'
import styles from './TripDetail.module.css'
import { Trip, Expense } from '@/types'

interface TripDetailProps {
  tripId: string
  onBack: () => void
  onAddExpense: () => void
  onEditExpense: (expenseId: string) => void
}

export function TripDetail({ tripId, onBack, onAddExpense, onEditExpense }: TripDetailProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTripData()
  }, [tripId])

  const loadTripData = async () => {
    setLoading(true)
    setError('')
    try {
      const tripData = await getTrip(tripId)
      setTrip(tripData)
      const expensesData = await getExpenses(tripId)
      setExpenses(expensesData)
    } catch (err: any) {
      setError(err.message || 'Failed to load trip')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <div className={styles.page}>
          <Button onClick={onBack} variant="ghost">
            ← Back
          </Button>
          <div className={styles.loading}>Loading trip...</div>
        </div>
      </Container>
    )
  }

  if (!trip) {
    return (
      <Container>
        <div className={styles.page}>
          <Button onClick={onBack} variant="ghost">
            ← Back
          </Button>
          <Card>
            <p>Trip not found</p>
          </Card>
        </div>
      </Container>
    )
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0)
  const expensesByCategory = expenses.reduce(
    (acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount.toString())
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <Container>
      <div className={styles.page}>
        <Button onClick={onBack} variant="ghost" className={styles.backButton}>
          ← Back
        </Button>

        <div className={styles.header}>
          <div>
            <h1>{trip.destination}</h1>
            <p>{formatDateRange(trip.start_date, trip.end_date)}</p>
          </div>
          <Button onClick={onAddExpense} size="lg">
            + Add Expense
          </Button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.summary}>
          <Card>
            <div className={styles.summaryContent}>
              <div>
                <p className={styles.label}>Total Spent</p>
                <p className={styles.amount}>{formatCurrency(totalExpenses, trip.currency)}</p>
              </div>
              <div>
                <p className={styles.label}>Expenses</p>
                <p className={styles.amount}>{expenses.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {Object.keys(expensesByCategory).length > 0 && (
          <div className={styles.categoryBreakdown}>
            <h2>By Category</h2>
            <div className={styles.categories}>
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className={styles.categoryItem}>
                  <span>{category}</span>
                  <span className={styles.categoryAmount}>{formatCurrency(amount, trip.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.expenses}>
          <h2>Expenses</h2>
          {expenses.length === 0 ? (
            <Card>
              <p className={styles.emptyMessage}>No expenses yet. Add your first expense!</p>
            </Card>
          ) : (
            <div className={styles.expensesList}>
              {expenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  description={expense.description}
                  amount={formatCurrency(parseFloat(expense.amount.toString()), trip.currency)}
                  category={expense.category}
                  date={expense.expense_date}
                  onClick={() => onEditExpense(expense.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
