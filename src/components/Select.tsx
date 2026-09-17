interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; options: Array<{ value: string; label: string }> }

export function Select({ label, error, options, style, ...props }: SelectProps) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
    {label && <label style={{ fontSize: '.875rem', fontWeight: 500 }}>{label}</label>}
    <select {...props} style={{ padding: '.75rem', border: `1px solid ${error ? '#ef4444' : '#e5e7eb'}`, borderRadius: 6, fontSize: '1rem', background: '#fff', ...style }}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    {error && <p style={{ fontSize: '.875rem', color: '#dc2626', margin: 0 }}>{error}</p>}
  </div>
}
