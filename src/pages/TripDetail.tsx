import { useState, useEffect } from 'react'
import { getTrip } from '@/lib/trips'
import { getExpenses } from '@/lib/expenses'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import { ExpenseItem } from '@/components/ExpenseItem'
import styles from './TripDetail.module.css'
import { Trip, Expense } from '@/types'
import { formatCurrency, formatDateRange } from '@/lib/format'

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
    loadData()
  }, [tripId])

  const loadData = async () => {
    setLoading(true)
    try {
      const tripData = await getTrip(tripId)
      const expensesData = await getExpenses(tripId)
      setTrip(tripData)
      setExpenses(expensesData)
    } catch (err: any) {
      setError(err.message || 'Failed to load trip')
    } finally {
      setLoading(false)
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const expensesByCategory = expenses.reduce(
    (acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    },
    {} as Record<string, number>
  )

  if (loading) {
    return (
      <Container>
        <div className={styles.container}>
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
        <div className={styles.container}>
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
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>{trip.destination}</h1>
            <p className={styles.dates}>{formatDateRange(trip.start_date, trip.end_date)}</p>
          </div>
          <Button onClick={onBack} variant="secondary">
            Back to Trips
          </Button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.grid}>
          <Card>
            <h2>Summary</h2>
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span>Total Expenses:</span>
                <span className={styles.amount}>{formatCurrency(totalExpenses, trip.currency)}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Number of Expenses:</span>
                <span>{expenses.length}</span>
              </div>
            </div>
          </Card>

          {Object.keys(expensesByCategory).length > 0 && (
            <Card>
              <h2>By Category</h2>
              <div className={styles.categories}>
                {Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className={styles.categoryItem}>
                    <span>{category}</span>
                    <span>{formatCurrency(amount, trip.currency)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div>
          <div className={styles.expensesHeader}>
            <h2>Expenses</h2>
            <Button onClick={onAddExpense}>Add Expense</Button>
          </div>

          {expenses.length === 0 ? (
            <Card>
              <p>No expenses yet. Add your first expense!</p>
            </Card>
          ) : (
            <div className={styles.expensesList}>
              {expenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  currency={trip.currency}
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
