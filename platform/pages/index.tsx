import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

type ProgressEntry = {
  id: string
  title: string
  status: string
  notes?: string | null
}

export default function Home() {
  const router = useRouter()
  const { role } = router.query as { role?: string }
  const { session, loading } = useAuth()
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [hasProgressItems, setHasProgressItems] = useState<boolean | null>(null)

  const preserveRoleHref = (path: string) => {
    return role ? `${path}?role=${encodeURIComponent(role)}` : path
  }

  useEffect(() => {
    if (!session) return

    fetch('/api/progress')
      .then((res) => res.json())
      .then((entries: ProgressEntry[]) => setHasProgressItems(entries.length > 0))
      .catch(() => setHasProgressItems(false))
  }, [session])

  const handleGenerateSummary = async () => {
    if (!session) {
      setSummaryError('Sign in first to generate an AI summary.')
      return
    }

    setSummaryError(null)
    setIsSummarizing(true)

    const entriesResponse = await fetch('/api/progress')
    if (!entriesResponse.ok) {
      setIsSummarizing(false)
      setSummaryError('Unable to load progress items for summary.')
      return
    }

    const entries: ProgressEntry[] = await entriesResponse.json()
    if (entries.length === 0) {
      setIsSummarizing(false)
      setSummaryError('Add progress items on the tracker before generating a summary.')
      return
    }

    const summaryResponse = await fetch('/api/progress/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: entries.map((entry) => ({ title: entry.title, status: entry.status, notes: entry.notes })) }),
    })

    setIsSummarizing(false)

    if (!summaryResponse.ok) {
      const body = await summaryResponse.json().catch(() => null)
      setSummaryError(body?.error || 'Unable to generate summary.')
      return
    }

    const body = await summaryResponse.json()
    setSummary(body.summary)
  }

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
          <h1 className="text-4xl font-bold text-slate-900">ADPAIS</h1>
          <p className="mt-4 text-slate-600">AI-Powered Department Performance & Accreditation Intelligence System for accreditation, risk detection, and executive insights.</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {session ? (
              <>
                <Link href={preserveRoleHref('/dashboard')} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                  Open Intelligence Dashboard
                </Link>
                <Link href={preserveRoleHref('/progress')} className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
                  Open Progress tracker
                </Link>
                <Link href={preserveRoleHref('/events')} className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
                  Open Events page
                </Link>
                <Link href="/api/events" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
                  View Events API
                </Link>
              </>
            ) : (
              <Link href={preserveRoleHref('/login')} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                Sign in to get started
              </Link>
            )}
          </div>
        </section>

        {session ? (
          <section className="card p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">AI Summary for progress</h2>
                <p className="mt-2 text-slate-600">
                  Generate a concise summary of the latest progress tracker items using OpenAI or the built-in fallback summary.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isSummarizing}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {isSummarizing ? 'Generating summary...' : 'Generate AI summary'}
              </button>
            </div>

            {summaryError ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{summaryError}</div>
            ) : null}

            {summary ? (
              <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 whitespace-pre-line">
                {summary}
              </div>
            ) : null}

            {hasProgressItems === false ? (
              <p className="mt-6 text-sm text-slate-600">No progress entries exist yet. Add items on the tracker to generate a summary.</p>
            ) : null}
          </section>
        ) : null}

        <section className="card p-8">
          <h2 className="text-2xl font-semibold text-slate-900">What&apos;s next</h2>
          <p className="mt-3 text-slate-600">
            {session 
              ? 'ADPAIS centralizes department performance, risk, accreditation readiness, and AI-driven summaries. Explore the dashboard for executive insights.'
              : 'Sign in with your Google account to access academic performance analytics and accreditation intelligence.'}
          </p>
        </section>
      </div>
    </main>
  )
}
