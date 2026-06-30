import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

type ProgressEntry = {
  id: string
  status: string
  createdAt: string
}

export default function HealthOverviewPage() {
  const router = useRouter()
  const { session, loading } = useAuth()
  const [items, setItems] = useState<ProgressEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    fetch('/api/progress')
      .then((res) => res.json())
      .then((data: ProgressEntry[]) => setItems(data))
      .catch(() => setError('Unable to load health metrics.'))
  }, [session])

  const analytics = useMemo(() => {
    const total = items.length
    const done = items.filter((item) => item.status === 'done').length
    const healthScore = total === 0 ? 0 : Math.round((done / total) * 100)
    const planned = items.filter((item) => item.status === 'planned').length
    const inProgress = items.filter((item) => item.status === 'in-progress').length

    return { total, done, planned, inProgress, healthScore }
  }, [items])

  if (loading) return <div className="p-8">Loading...</div>

  const role = router.query.role as string | undefined
  const backHref = role ? `/role-dashboard?role=${encodeURIComponent(role)}` : '/role-dashboard'

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Department Health Overview</h1>
              <p className="mt-2 text-slate-600">Track completion, in-progress items, and accreditation readiness at a glance.</p>
            </div>
            <Link href={backHref} className="text-sm text-slate-600 hover:underline">
              Back to role dashboard
            </Link>
          </div>

          {error ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Total items</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{analytics.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Done</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{analytics.done}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">In progress</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{analytics.inProgress}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Health score</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{analytics.healthScore}%</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
