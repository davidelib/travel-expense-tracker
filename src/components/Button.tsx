import { Button as ButtonBase } from './Button'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <ButtonBase
      {...props}
      disabled={disabled || loading}
      className={`button ${variant} ${size} ${fullWidth ? 'fullWidth' : ''}`}
    >
      {loading ? '...' : children}
    </ButtonBase>
  )
}
