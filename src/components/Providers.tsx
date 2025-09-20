'use client'

import { SessionProvider } from 'next-auth/react'
import ErrorBoundary from './ErrorBoundary'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </SessionProvider>
  )
}
