import { useState, useEffect } from 'react'
import { getExpense, updateExpense, deleteExpense, getCategories } from '@/lib/expenses'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import styles from './EditExpense.module.css'
import { Expense } from '@/types'

interface EditExpenseProps {
  expenseId: string
  onSuccess: () => void
  onCancel: () => void
}

export function EditExpense({ expenseId, onSuccess, onCancel }: EditExpenseProps) {
  const [expense, setExpense] = useState<Expense | null>(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState('')
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [expenseId])

  const loadData = async () => {
    setLoading(true)
    try {
      const exp = await getExpense(expenseId)
      setExpense(exp)
      setAmount(exp.amount.toString())
      setCategory(exp.category)
      setDescription(exp.description)
      setExpenseDate(exp.expense_date)

      const cats = await getCategories()
      setCategories(cats.map((c) => ({ value: c.name, label: c.name })))
    } catch (err: any) {
      setError(err.message || 'Failed to load expense')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
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

    setSaving(true)

    try {
      await updateExpense(expenseId, {
        amount: parseFloat(amount),
        category,
        description,
        expense_date: expenseDate,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to update expense')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    setSaving(true)

    try {
      await deleteExpense(expenseId)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <div className={styles.container}>
          <Card>
            <p>Loading expense...</p>
          </Card>
        </div>
      </Container>
    )
  }

  if (!expense) {
    return (
      <Container>
        <div className={styles.container}>
          <Card>
            <p>Expense not found</p>
            <Button onClick={onCancel} variant="secondary">
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
        <Card>
          <div className={styles.header}>
            <h1>Edit Expense</h1>
          </div>

          <form onSubmit={handleUpdate} className={styles.form}>
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
              <Button type="submit" fullWidth loading={saving}>
                Update Expense
              </Button>
              <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
                Cancel
              </Button>
              <Button type="button" variant="danger" fullWidth onClick={handleDelete} disabled={saving}>
                Delete
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  )
}
