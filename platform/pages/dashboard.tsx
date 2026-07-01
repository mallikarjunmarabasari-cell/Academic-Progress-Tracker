import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

type ProgressEntry = {
  id: string
  title: string
  status: string
  notes?: string | null
  createdAt: string
  createdBy?: {
    email: string
    name?: string | null
  } | null
}

type SummaryHistoryItem = {
  id: string
  summary: string
  provider: string
  generatedAt: string
  entryCount: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { role } = router.query as { role?: string }
  const { session, loading } = useAuth()
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(true)
  const [summaryHistory, setSummaryHistory] = useState<SummaryHistoryItem[]>([])
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preserveRoleHref = (path: string) => {
    return role ? `${path}?role=${encodeURIComponent(role)}` : path
  }

  useEffect(() => {
    if (!session) {
      setIsLoadingEntries(false)
      return
    }

    fetch('/api/progress')
      .then((res) => res.json())
      .then((data: ProgressEntry[]) => setEntries(data))
      .catch(() => setError('Unable to load progress entries.'))
      .finally(() => setIsLoadingEntries(false))
  }, [session])

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('progress-summary-history') : null
    if (stored) {
      try {
        setSummaryHistory(JSON.parse(stored))
      } catch {
        setSummaryHistory([])
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('progress-summary-history', JSON.stringify(summaryHistory))
  }, [summaryHistory])

  const analytics = useMemo(() => {
    const planned = entries.filter((entry) => entry.status === 'planned').length
    const inProgress = entries.filter((entry) => entry.status === 'in-progress').length
    const done = entries.filter((entry) => entry.status === 'done').length
    const mostRecent = entries[0]

    return { total: entries.length, planned, inProgress, done, mostRecent }
  }, [entries])

  const handleGenerateSummary = async () => {
    setError(null)
    if (!session) {
      setError('Please sign in to generate a summary.')
      return
    }

    if (!entries.length) {
      setError('Add progress items before generating a summary.')
      return
    }

    setIsSummarizing(true)

    const response = await fetch('/api/progress/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: entries.map((entry) => ({ title: entry.title, status: entry.status, notes: entry.notes })) }),
    })

    setIsSummarizing(false)

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      setError(body?.error || 'Unable to generate summary.')
      return
    }

    const body = await response.json()
    const nextSummary: SummaryHistoryItem = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()),
      summary: body.summary,
      provider: body.provider ?? 'unknown',
      generatedAt: new Date().toISOString(),
      entryCount: entries.length,
    }

    setSummaryHistory((current) => [nextSummary, ...current].slice(0, 20))
  }

  const clearHistory = () => {
    setSummaryHistory([])
  }

  if (loading || isLoadingEntries) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4 mx-auto"></div>
          <p className="text-slate-600 text-lg">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Progress Dashboard</h1>
          <p className="text-slate-600">Sign in to view summary analytics and your progress history.</p>
          <Link href={preserveRoleHref('/login')} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Sign in to continue
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="card p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Progress Summary Dashboard</h1>
              <p className="mt-2 text-slate-600">View progress analytics, generate AI summaries, and keep a history of your generated reports.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={preserveRoleHref('/progress')} className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
                Open Progress tracker
              </Link>
              <Link href={preserveRoleHref('/events')} className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
                View Events API
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          {[
            { title: 'Total entries', value: analytics.total },
            { title: 'Planned', value: analytics.planned },
            { title: 'In progress', value: analytics.inProgress },
            { title: 'Completed', value: analytics.done },
          ].map((card) => (
            <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">{card.title}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">AI Summary generator</h2>
                <p className="mt-2 text-slate-600">Generate an executive summary of your latest progress entries and save it to dashboard history.</p>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={isSummarizing || analytics.total === 0}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {isSummarizing ? 'Generating...' : 'Generate summary'}
              </button>
            </div>

            {error ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Most recent entry</p>
              {analytics.mostRecent ? (
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">{analytics.mostRecent.title}</p>
                  <p>{analytics.mostRecent.notes ?? 'No notes provided.'}</p>
                  <p className="text-slate-500">Status: {analytics.mostRecent.status}</p>
                </div>
              ) : (
                <p className="mt-3 text-slate-600">No progress entries yet. Add items in the tracker to populate analytics.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Progress details</h2>
                <p className="mt-2 text-slate-600">See the latest progress items and their statuses.</p>
              </div>
            </div>

            {analytics.total === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">No progress entries available.</div>
            ) : (
              <div className="mt-6 space-y-4">
                {entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-900">{entry.title}</p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">{entry.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{entry.notes ?? 'No notes provided.'}</p>
                    <p className="mt-3 text-xs text-slate-500">Added on {new Date(entry.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Summary history</h2>
              <p className="mt-2 text-slate-600">Recent AI summaries generated from your progress records.</p>
            </div>
            <button
              type="button"
              onClick={clearHistory}
              disabled={summaryHistory.length === 0}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear history
            </button>
          </div>

          {summaryHistory.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">No summaries generated yet. Use the button above to create one.</div>
          ) : (
            <div className="mt-6 space-y-4">
              {summaryHistory.map((item) => (
                <article key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-slate-900">{new Date(item.generatedAt).toLocaleString()}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span>Entries: {item.entryCount}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1">{item.provider}</span>
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">{item.summary}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
