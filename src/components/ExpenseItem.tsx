import styles from './ExpenseItem.module.css'
import { formatDateShort } from '@/lib/format'

interface ExpenseItemProps {
  description: string
  amount: string
  category: string
  date: string
  onClick: () => void
}

export function ExpenseItem({ description, amount, category, date, onClick }: ExpenseItemProps) {
  return (
    <div className={styles.item} onClick={onClick}>
      <div className={styles.content}>
        <div className={styles.main}>
          <p className={styles.description}>{description}</p>
          <p className={styles.category}>{category}</p>
        </div>
        <p className={styles.date}>{formatDateShort(date)}</p>
      </div>
      <div className={styles.amount}>{amount}</div>
    </div>
  )
}
