import { useRouter } from 'next/router'
import Link from 'next/link'
import { useMemo } from 'react'
import RoleSelector from '@/components/RoleSelector'
import RoleDashboard from '@/components/RoleDashboard'
import { useAuth } from '@/context/AuthContext'

export default function Page() {
  const router = useRouter()
  const { role } = router.query as { role?: string }
  const { session, loading } = useAuth()

  // Dummy analytics pulled from local data; reuse existing progress endpoint in future
  const analytics = useMemo(() => ({ total: 42, planned: 8, inProgress: 12, done: 22 }), [])

  if (loading) return <div className="p-8">Loading...</div>

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
        </section>
      </div>
    </main>
  )
}
