import { useRouter } from 'next/router'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function RequestReviewPage() {
  const router = useRouter()
  const { loading } = useAuth()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const role = router.query.role as string | undefined
  const backHref = role ? `/role-dashboard?role=${encodeURIComponent(role)}` : '/role-dashboard'

  if (loading) return <div className="p-8">Loading...</div>

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('Your review request has been submitted. Faculty will be notified.')
    setMessage('')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Request Review</h1>
              <p className="mt-2 text-slate-600">Submit a request for faculty feedback on your progress entry or milestone.</p>
            </div>
            <Link href={backHref} className="text-sm text-slate-600 hover:underline">
              Back to role dashboard
            </Link>
          </div>

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
