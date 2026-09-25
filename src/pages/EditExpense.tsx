import { useState } from 'react'
import { deleteExpense, updateExpense } from '@/lib/expenses'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'
import { Expense } from '@/types'

const categories = [
  { value: 'Accommodation', label: 'Accommodation' }, { value: 'Food & Dining', label: 'Food & Dining' }, { value: 'Transportation', label: 'Transportation' }, { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Shopping', label: 'Shopping' }, { value: 'Activities', label: 'Activities' }, { value: 'Flights', label: 'Flights' }, { value: 'Taxi & Rideshare', label: 'Taxi & Rideshare' },
  { value: 'Cash Withdrawals', label: 'Cash Withdrawals' }, { value: 'Bank & Transaction Fees', label: 'Bank & Transaction Fees' }, { value: 'SIM Card', label: 'SIM Card' }, { value: 'Other', label: 'Other' },
]
interface EditExpenseProps { expense: Expense; onSuccess: () => void; onCancel: () => void }

export function EditExpense({ expense, onSuccess, onCancel }: EditExpenseProps) {
  const [amount, setAmount] = useState(String(expense.amount))
  const [category, setCategory] = useState(expense.category)
  const [description, setDescription] = useState(expense.description ?? '')
  const [expenseDate, setExpenseDate] = useState(expense.expense_date)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const numAmount = parseFloat(amount)
    if (!amount || !category || !expenseDate) return setError('Amount, category, and date are required')
    if (isNaN(numAmount) || numAmount <= 0) return setError('Amount must be a positive number')
    setLoading(true)
    try {
      await updateExpense(expense.id, { amount: numAmount, category, description: description.trim() || null, expense_date: expenseDate })
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update expense')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return
    setDeleteLoading(true)
    try {
      await deleteExpense(expense.id)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <Container>
      <div style={pageStyle}>
        <Card>
          <h1 style={{ marginTop: 0 }}>Edit Expense</h1>
          <form onSubmit={handleSubmit} style={formStyle}>
            <Input label="Amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={categories} />
            <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input label="Date" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />
            {error && <div style={errorStyle}>{error}</div>}
            <div style={actionsStyle}>
              <Button type="submit" fullWidth loading={loading}>Update Expense</Button>
              <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
              <Button type="button" variant="danger" fullWidth onClick={handleDelete} loading={deleteLoading}>Delete</Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  )
}
const pageStyle: React.CSSProperties = { width: '100%', maxWidth: 960, margin: '0 auto', padding: '2rem 0', minHeight: '100vh' }
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' }
const actionsStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.5rem' }
const errorStyle: React.CSSProperties = { padding: '.75rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', fontSize: '.875rem' }
