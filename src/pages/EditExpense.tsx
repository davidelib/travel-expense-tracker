import { useState } from 'react'
import { deleteExpense, updateExpense } from '@/lib/expenses'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import styles from './EditExpense.module.css'
import { Expense } from '@/types'

const categories = [
  { value: 'Accommodation', label: 'Accommodation' },
  { value: 'Food & Dining', label: 'Food & Dining' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Activities', label: 'Activities' },
  { value: 'Other', label: 'Other' },
]

interface EditExpenseProps {
  expense: Expense
  onSuccess: () => void
  onCancel: () => void
}

export function EditExpense({ expense, onSuccess, onCancel }: EditExpenseProps) {
  const [amount, setAmount] = useState(expense.amount.toString())
  const [category, setCategory] = useState(expense.category)
  const [description, setDescription] = useState(expense.description)
  const [expenseDate, setExpenseDate] = useState(expense.expense_date)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || !category || !description || !expenseDate) {
      setError('All fields are required')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number')
      return
    }

    setLoading(true)

    try {
      await updateExpense(expense.id, {
        amount: numAmount,
        category,
        description,
        expense_date: expenseDate,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to update expense')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }

    setDeleteLoading(true)

    try {
      await deleteExpense(expense.id)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <Container>
      <div className={styles.container}>
        <Card>
          <div className={styles.header}>
            <h1>Edit Expense</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Amount"
              type="number"
              step="0.01"
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
              placeholder="e.g., Hotel booking"
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
                Update Expense
              </Button>
              <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                fullWidth
                onClick={handleDelete}
                loading={deleteLoading}
              >
                Delete
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  )
}
