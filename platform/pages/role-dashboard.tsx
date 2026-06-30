import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import RoleSelector from '@/components/RoleSelector'
import RoleDashboard from '@/components/RoleDashboard'
import { useAuth } from '@/context/AuthContext'

type ProgressEntry = {
  id: string
  title: string
  status: string
  notes?: string | null
  createdAt: string
  createdBy?: { id: string; email?: string; name?: string | null; role?: string } | null
}

export default function Page() {
  const router = useRouter()
  const { role } = router.query as { role?: string }
  const { session, loading } = useAuth()

  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    fetch('/api/progress')
      .then((res) => res.json())
      .then((data: ProgressEntry[]) => {
        if (!mounted) return
        setEntries(data)
      })
      .catch(() => setError('Unable to load progress entries.'))
      .finally(() => setIsLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const r = (role as string) || 'Student'

    if (!entries || !entries.length) return []

    if (r === 'Student') {
      const me = session?.user?.id ?? null
      return entries.filter((e) => e.createdBy?.id === me)
    }

    if (r === 'Faculty') {
      // Faculty sees departmental entries (exclude anonymous)
      return entries.filter((e) => !!e.createdBy)
    }

    if (r === 'Coordinator' || r === 'HOD') {
      return entries
    }

    return entries
  }, [entries, role, session])

  const analytics = useMemo(() => {
    const planned = filtered.filter((entry) => entry.status === 'planned').length
    const inProgress = filtered.filter((entry) => entry.status === 'in-progress').length
    const done = filtered.filter((entry) => entry.status === 'done').length
    const total = filtered.length
    const mostRecent = filtered[0]
    const healthScore = total === 0 ? 0 : Math.round((done / total) * 100)

    return { total, planned, inProgress, done, mostRecent, healthScore }
  }, [filtered])

  if (loading || isLoading) return <div className="p-8">Loading...</div>

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="card p-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Role-based Dashboards</h1>
            <p className="mt-1 text-sm text-slate-600">Switch context to preview user-facing KPIs and actions for each role.</p>
          </div>
          <div className="flex items-center gap-4">
            <RoleSelector defaultRole={(role as string) ?? 'Student'} />
            <Link href="/dashboard" className="text-sm text-slate-600 hover:underline">Return to main dashboard</Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <RoleDashboard role={(role as string) ?? 'Student'} analytics={analytics} />
          <div className="mt-4 text-sm text-slate-500">Showing {analytics.total} items (Health score: {analytics.healthScore}%)</div>
        </section>
      </div>
    </main>
  )
}
