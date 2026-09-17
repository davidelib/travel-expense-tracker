import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <input {...props} className={`${styles.input} ${error ? styles.error : ''}`} />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  )
}
