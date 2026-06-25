import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from '@/context/AuthContext'

// Protected pages that require authentication
const protectedPages = ['/events', '/dashboard']

function AppWithAuth({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { session, loading } = useAuth()
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  useEffect(() => {
    if (!loading) {
      setIsAuthChecked(true)
      
      // Redirect to login if accessing protected page without session
      if (protectedPages.includes(router.pathname) && !session) {
        router.push('/login')
      }

      // Redirect to events if already logged in and on login page
      if (router.pathname === '/login' && session) {
        router.push('/events')
      }
    }
  }, [loading, session, router])

  // Show loading state while checking authentication
  if (loading || (!isAuthChecked && protectedPages.includes(router.pathname))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return <Component {...pageProps} />
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppWithAuth Component={Component} pageProps={pageProps} />
    </AuthProvider>
  )
}
