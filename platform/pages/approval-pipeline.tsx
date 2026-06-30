import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

type ProgressEntry = {
  id: string
  title: string
  status: string
  createdAt: string
}

export default function ApprovalPipelinePage() {
  const { session, loading } = useAuth()
  const [items, setItems] = useState<ProgressEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    fetch('/api/progress')
      .then((res) => res.json())
      .then((data: ProgressEntry[]) => setItems(data.filter((item) => item.status === 'planned' || item.status === 'in-progress')))
      .catch(() => setError('Unable to load pipeline items.'))
  }, [session])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Approval Pipeline</h1>
              <p className="mt-2 text-slate-600">Review the workflow pipeline and approve the next steps for department progress items.</p>
            </div>
            <Link href="/dashboard" className="text-sm text-slate-600 hover:underline">
              Back to dashboard
            </Link>
          </div>

          {error ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">No pipeline items require approval right now.</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                      <p className="mt-1 text-sm text-slate-500">Created on {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{item.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
