interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }

export function Input({ label, error, style, ...props }: InputProps) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
    {label && <label style={{ fontSize: '.875rem', fontWeight: 500 }}>{label}</label>}
    <input {...props} style={{ padding: '.75rem', border: `1px solid ${error ? '#ef4444' : '#e5e7eb'}`, borderRadius: 6, fontSize: '1rem', ...style }} />
    {error && <p style={{ fontSize: '.875rem', color: '#dc2626', margin: 0 }}>{error}</p>}
  </div>
}
