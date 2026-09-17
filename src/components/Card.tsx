interface CardProps { children: React.ReactNode }

export function Card({ children }: CardProps) {
  return <div style={{ background: '#fff', borderRadius: 8, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,.1)', border: '1px solid #e5e7eb' }}>{children}</div>
}
