import { useState } from 'react'
import { createExpenses } from '@/lib/expenses'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Container } from '@/components/Container'
import { Card } from '@/components/Card'

const categories = [
  { value: 'Accommodation', label: 'Accommodation' },
  { value: 'Food & Dining', label: 'Food & Dining' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Activities', label: 'Activities' },
  { value: 'Other', label: 'Other' },
]

interface AddExpenseProps {
  tripId: string
  onSuccess: () => void
  onCancel: () => void
}

interface ExpenseDraft {
  id: string
  amount: string
  category: string
  description: string
  expenseDate: string
}

function createExpenseDraft(): ExpenseDraft {
  return {
    id: crypto.randomUUID(),
    amount: '',
    category: 'Food & Dining',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
  }
}

export function AddExpense({ tripId, onSuccess, onCancel }: AddExpenseProps) {
  const [expenses, setExpenses] = useState<ExpenseDraft[]>([createExpenseDraft()])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const invalidExpenseIndex = expenses.findIndex((expense) => {
      const amount = Number(expense.amount)
      return !expense.amount || !Number.isFinite(amount) || amount <= 0 || !expense.expenseDate
    })
    if (invalidExpenseIndex !== -1) {
      setError(`Expense ${invalidExpenseIndex + 1} needs a positive amount and date`)
      return
    }

    setLoading(true)
    try {
      await createExpenses(expenses.map((expense) => ({
        trip_id: tripId,
        amount: Number(expense.amount),
        category: expense.category,
        description: expense.description.trim() || null,
        expense_date: expense.expenseDate,
      })))
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const updateExpense = (id: string, updates: Partial<ExpenseDraft>) => {
    setExpenses((currentExpenses) => currentExpenses.map((expense) => (
      expense.id === id ? { ...expense, ...updates } : expense
    )))
  }

  const removeExpense = (id: string) => {
    setExpenses((currentExpenses) => currentExpenses.filter((expense) => expense.id !== id))
  }

  return (
    <Container>
      <div style={pageStyle}>
        <Card>
          <h1 style={{ marginTop: 0 }}>Add Expenses</h1>
          <form onSubmit={handleSubmit} style={formStyle}>
            {expenses.map((expense, index) => (
              <fieldset key={expense.id} style={expenseStyle}>
                <legend style={legendStyle}>Expense {index + 1}</legend>
                {expenses.length > 1 && (
                  <Button type="button" variant="secondary" onClick={() => removeExpense(expense.id)} style={removeButtonStyle}>
                    Remove
                  </Button>
                )}
                <Input label="Amount" type="number" step="0.01" min="0.01" value={expense.amount} onChange={(e) => updateExpense(expense.id, { amount: e.target.value })} placeholder="0.00" required />
                <Select label="Category" value={expense.category} onChange={(e) => updateExpense(expense.id, { category: e.target.value })} options={categories} />
                <Input label="Description (optional)" value={expense.description} onChange={(e) => updateExpense(expense.id, { description: e.target.value })} placeholder="e.g., Hotel booking" />
                <Input label="Date" type="date" value={expense.expenseDate} onChange={(e) => updateExpense(expense.id, { expenseDate: e.target.value })} required />
              </fieldset>
            ))}
            <Button type="button" variant="secondary" onClick={() => setExpenses((currentExpenses) => [...currentExpenses, createExpenseDraft()])}>
              Add another expense
            </Button>
            {error && <div style={errorStyle}>{error}</div>}
            <div style={actionsStyle}>
              <Button type="submit" fullWidth loading={loading}>Add {expenses.length} {expenses.length === 1 ? 'Expense' : 'Expenses'}</Button>
              <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  )
}

const pageStyle: React.CSSProperties = { width: '100%', maxWidth: 960, margin: '0 auto', padding: '2rem 0', minHeight: '100vh' }
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' }
const expenseStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem', margin: 0, padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 6 }
const legendStyle: React.CSSProperties = { padding: '0 .25rem', fontWeight: 600 }
const removeButtonStyle: React.CSSProperties = { alignSelf: 'flex-end' }
const actionsStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.5rem' }
const errorStyle: React.CSSProperties = { padding: '.75rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#991b1b', fontSize: '.875rem' }
