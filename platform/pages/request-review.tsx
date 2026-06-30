import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import RolePageHeader from '@/components/RolePageHeader'

export default function RequestReviewPage() {
  const { loading } = useAuth()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  if (loading) return <div className="p-8">Loading...</div>

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('Your review request has been submitted. Faculty will be notified.')
    setMessage('')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <RolePageHeader
          title="Request Review"
          subtitle="Submit a request for faculty feedback on your progress entry or milestone."
          backHref="/role-dashboard"
          backLabel="Back to role dashboard"
        />

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Request details</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="mt-2 w-full min-h-[140px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Please describe what you need reviewed or which item needs feedback."
              />
            </label>
            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
              Send request
            </button>
          </form>

          {status ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</div> : null}
        </section>
      </div>
    </main>
  )
}
