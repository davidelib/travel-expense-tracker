type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg'; fullWidth?: boolean; loading?: boolean }

export function Button({ variant = 'primary', size = 'md', fullWidth = false, loading = false, children, disabled, style, ...props }: ButtonProps) {
  const colors = { primary: ['#2563eb', '#fff'], secondary: ['#e5e7eb', '#1a1a1a'], ghost: ['transparent', '#2563eb'], danger: ['#ef4444', '#fff'] }[variant]
  const padding = size === 'sm' ? '.5rem 1rem' : size === 'lg' ? '1rem 2rem' : '.75rem 1.5rem'
  return <button {...props} disabled={disabled || loading} style={{ padding, border: variant === 'ghost' ? '1px solid #e5e7eb' : 'none', borderRadius: 6, background: colors[0], color: colors[1], fontSize: size === 'sm' ? '.875rem' : size === 'lg' ? '1.125rem' : '1rem', cursor: disabled || loading ? 'not-allowed' : 'pointer', opacity: disabled || loading ? .6 : 1, width: fullWidth ? '100%' : undefined, ...style }}>{loading ? 'Loading...' : children}</button>
}
