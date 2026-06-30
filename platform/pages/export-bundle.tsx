import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import RolePageHeader from '@/components/RolePageHeader'

export default function ExportBundlePage() {
  const { loading } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (loading) return <div className="p-8">Loading...</div>

  const handleExport = async () => {
    setExporting(true)
    setMessage(null)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setExporting(false)
    setMessage('Your accreditation bundle is ready for download. (Simulated export)')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <RolePageHeader
          title="Export Accreditation Bundle"
          subtitle="Generate a compressed package of progress records and evidence for review."
          backHref="/role-dashboard"
          backLabel="Back to role dashboard"
        />

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-600">This tool prepares a bundle of document summaries, progress entries, and accreditation notes.</p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {exporting ? 'Exporting…' : 'Generate export bundle'}
            </button>
            {message ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
          </div>
        </section>
      </div>
    </main>
  )
}
