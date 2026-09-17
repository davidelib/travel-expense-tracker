import styles from './ExpenseItem.module.css'
import { Expense } from '@/types'
import { formatCurrency, formatDateShort } from '@/lib/format'

interface ExpenseItemProps {
  expense: Expense
  currency: string
  onClick: () => void
}

export function ExpenseItem({ expense, currency, onClick }: ExpenseItemProps) {
  return (
    <div className={styles.item} onClick={onClick}>
      <div className={styles.content}>
        <div className={styles.main}>
          <p className={styles.description}>{expense.description}</p>
          <p className={styles.category}>{expense.category}</p>
          <p className={styles.date}>{formatDateShort(expense.expense_date)}</p>
        </div>
        <div className={styles.amount}>{formatCurrency(expense.amount, currency)}</div>
      </div>
    </div>
  )
}
