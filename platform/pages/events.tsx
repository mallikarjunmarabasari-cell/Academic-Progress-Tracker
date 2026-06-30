import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import RolePageHeader from '@/components/RolePageHeader'

type EventItem = {
  id: string
  title: string
  description?: string | null
  startTime: string
  createdAt: string
  createdBy?: {
    id: string
    email: string
    name?: string | null
    role: string
  } | null
}

type EventForm = {
  title: string
  description: string
  startTime: string
}

export default function EventsPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [form, setForm] = useState<EventForm>({ title: '', description: '', startTime: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then(setEvents)
      .catch(() => setError('Unable to load events.'))
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!form.title || !form.startTime) {
      setError('Please provide event title and start time.')
      return
    }

    setIsSaving(true)

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setIsSaving(false)

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      setError(body?.error || 'Unable to create event.')
      return
    }

    const createdEvent = (await response.json()) as EventItem
    setEvents((current) => [...current, createdEvent].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()))
    setForm({ title: '', description: '', startTime: '' })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <RolePageHeader
          title="Events"
          subtitle="Create and review upcoming events for your department."
          backHref="/role-dashboard"
          backLabel="Back to role dashboard"
          actions={[{ href: '/dashboard', label: 'Open dashboard', variant: 'ghost' }]}
        />

        <section className="card p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600">Logged in as <span className="font-semibold">{user?.email}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Sign Out
          </button>
        </section>

        <section className="card p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create new event</h2>
            <p className="mt-1 text-slate-600">Store events in the new platform database via Prisma.</p>
          </div>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Department meet-up"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Start time</span>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="sm:col-span-2 space-y-2">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full min-h-[120px] resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Agenda, location, or notes"
              />
            </label>

            <div className="sm:col-span-2 text-right">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSaving ? 'Saving...' : 'Add event'}
              </button>
            </div>
          </form>
        </section>

        <section className="card p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Upcoming events</h2>
              <p className="mt-1 text-slate-600">Events are stored and retrieved from the Prisma/Postgres backend.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {events.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                No events yet. Create your first event.
              </div>
            ) : (
              events.map((event) => (
                <article key={event.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{event.createdBy ? `Created by ${event.createdBy.name ?? event.createdBy.email}` : 'Created anonymously'}</p>
                    </div>
                    <time className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      {new Date(event.startTime).toLocaleString()}
                    </time>
                  </div>
                  {event.description ? <p className="mt-4 text-slate-600">{event.description}</p> : null}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
