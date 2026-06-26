import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

type ProgressEntry = {
  id: string
  title: string
  status: string
  notes?: string | null
  createdAt: string
  completedAt?: string | null
  createdBy?: {
    id: string
    email: string
    name?: string | null
    role: string
  } | null
}

export default function ProgressPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('planned')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch('/api/progress')
      .then((res) => res.json())
      .then(setEntries)
      .catch(() => setError('Unable to load progress items.'))
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Please enter a progress item title.')
      return
    }

    setIsSaving(true)

    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), status, notes: notes.trim() || undefined }),
    })

    setIsSaving(false)

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      setError(body?.error || 'Unable to save progress item.')
      return
    }

    const created = (await response.json()) as ProgressEntry
    setEntries((current) => [created, ...current])
    setTitle('')
    setStatus('planned')
    setNotes('')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="card p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Progress Tracker</h1>
            <p className="mt-2 text-slate-600">Track milestones, follow-up items, and study progress for your department.</p>
          </div>
          <div className="flex flex-col gap-2 text-right">
            <p className="text-sm text-slate-600">Logged in as <span className="font-semibold">{user?.email}</span></p>
            <button onClick={handleLogout} className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">Sign Out</button>
          </div>
        </section>

        <section className="card p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Add a progress item</h2>
            <p className="mt-1 text-slate-600">Capture updates, action items, and milestones in the same database.</p>
          </div>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2 space-y-2">
              <span className="text-sm font-medium text-slate-700">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200" placeholder="Finalize accreditation checklist" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200">
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Notes</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full min-h-[120px] resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200" placeholder="Optional details or next steps" />
            </label>

            <div className="md:col-span-2 text-right">
              <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400">
                {isSaving ? 'Saving...' : 'Add progress item'}
              </button>
            </div>
          </form>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold text-slate-900">Recent progress items</h2>
          <div className="mt-6 space-y-4">
            {entries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">No progress items yet. Add the first milestone.</div>
            ) : (
              entries.map((entry) => (
                <article key={entry.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{entry.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{entry.createdBy ? `Added by ${entry.createdBy.name ?? entry.createdBy.email}` : 'Added anonymously'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{entry.status}</span>
                      <time className="text-sm text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</time>
                    </div>
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
