import { useState, useEffect } from 'react'
import { createExpense, getCategories } from '@/lib/expenses'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import styles from './AddExpense.module.css'

interface AddExpenseProps {
  tripId: string
  onSuccess: () => void
  onCancel: () => void
}

export function AddExpense({ tripId, onSuccess, onCancel }: AddExpenseProps) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState('')
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const cats = await getCategories()
      setCategories(cats.map((c) => ({ value: c.name, label: c.name })))
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || !category || !description || !expenseDate) {
      setError('All fields are required')
      return
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    setLoading(true)

    try {
      await createExpense({
        trip_id: tripId,
        amount: parseFloat(amount),
        category,
        description,
        expense_date: expenseDate,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <div className={styles.container}>
        <Card>
          <div className={styles.header}>
            <h1>Add Expense</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categories}
            />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner at restaurant"
              required
            />
            <Input
              label="Date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.actions}>
              <Button type="submit" fullWidth loading={loading}>
                Add Expense
              </Button>
              <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  )
}
