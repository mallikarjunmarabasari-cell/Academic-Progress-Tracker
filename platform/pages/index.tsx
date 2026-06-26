import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4 mx-auto"></div>
          <p className="text-slate-600 text-lg">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-4xl space-y-10">
        <section className="card p-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900">Dept Intelligence Platform</h1>
          <p className="mt-4 text-slate-600">A modern platform scaffold with Prisma, Next.js, Tailwind, and a first Events workflow.</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {session ? (
              <>
                <Link href="/events" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                  Open Events dashboard
                </Link>
                <Link href="/progress" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
                  Open Progress tracker
                </Link>
                <Link href="/api/events" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
                  View Events API
                </Link>
              </>
            ) : (
              <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                Sign in to get started
              </Link>
            )}
          </div>
        </section>

        <section className="card p-8">
          <h2 className="text-2xl font-semibold text-slate-900">What&apos;s next</h2>
          <p className="mt-3 text-slate-600">
            {session 
              ? 'The Events page is now connected to the API and Supabase PostgreSQL. Next we can add Progress tracking and AI Summary features.'
              : 'Sign in with your Google account to access the Events dashboard and explore the platform.'}
          </p>
        </section>
      </div>
    </main>
  )
}
