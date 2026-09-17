interface ContainerProps { children: React.ReactNode }

export function Container({ children }: ContainerProps) {
  return <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>{children}</div>
}
