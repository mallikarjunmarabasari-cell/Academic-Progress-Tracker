import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

type ProgressEntry = {
  id: string
  title: string
  status: string
  notes?: string | null
  createdAt: string
  createdBy?: { name?: string | null; email: string }
}

export default function ReviewQueuePage() {
  const router = useRouter()
  const { session, loading } = useAuth()
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    fetch('/api/progress')
      .then((res) => res.json())
      .then((data: ProgressEntry[]) => setEntries(data.filter((item) => item.status !== 'done')))
      .catch(() => setError('Unable to load review items.'))
  }, [session])

  if (loading) return <div className="p-8">Loading...</div>

  const role = router.query.role as string | undefined
  const backHref = role ? `/role-dashboard?role=${encodeURIComponent(role)}` : '/role-dashboard'

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Review Queue</h1>
              <p className="mt-2 text-slate-600">Review progress entries that are still active and need your approval.</p>
            </div>
            <Link href={backHref} className="text-sm text-slate-600 hover:underline">
              Back to role dashboard
            </Link>
          </div>

          {error ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <div className="mt-6 space-y-4">
            {entries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">No pending review items currently.</div>
            ) : (
              entries.map((entry) => (
                <article key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{entry.title}</h2>
                      <p className="mt-1 text-sm text-slate-500">Submitted by {entry.createdBy?.name ?? entry.createdBy?.email}</p>
                    </div>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">{entry.status}</span>
                  </div>
                  {entry.notes ? <p className="mt-4 text-slate-600">{entry.notes}</p> : null}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
