import React from 'react'

type Analytics = {
  total: number
  planned: number
  inProgress: number
  done: number
  healthScore?: number
}

type Props = { role: string; analytics: Analytics }

function KPI({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function ActionCard({ title, description, actionLabel }: { title: string; description: string; actionLabel: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <button className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
        {actionLabel}
      </button>
    </div>
  )
}

export default function RoleDashboard({ role, analytics }: Props) {
  const common = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KPI title="Total Entries" value={analytics.total ?? 0} />
      <KPI title="Planned" value={analytics.planned ?? 0} />
      <KPI title="In progress" value={analytics.inProgress ?? 0} />
      <KPI title="Completed" value={analytics.done ?? 0} />
    </div>
  )

  if (role === 'Student') {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-900">Student dashboard</h2>
        <p className="text-sm text-slate-600">Personal progress, next actions, and recent submissions.</p>
        <div className="mt-4">{common}</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ActionCard
            title="Next assignment"
            description="Complete your next planned progress item to stay on schedule."
            actionLabel="View tasks"
          />
          <ActionCard
            title="Request review"
            description="Ask faculty for feedback on your latest submission."
            actionLabel="Send request"
          />
        </div>
      </section>
    )
  }

  if (role === 'Faculty') {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-900">Faculty dashboard</h2>
        <p className="text-sm text-slate-600">Pending reviews, approvals, and mentorship actions.</p>
        <div className="mt-4">{common}</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ActionCard
            title="Review queue"
            description="Access submissions awaiting faculty review and approvals."
            actionLabel="Review now"
          />
          <ActionCard
            title="Student outreach"
            description="Message students with overdue or high-priority progress items."
            actionLabel="Send note"
          />
        </div>
      </section>
    )
  }

  if (role === 'Coordinator') {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-900">Department Coordinator</h2>
        <p className="text-sm text-slate-600">Department-wide KPIs, approvals, and accreditation readiness tools.</p>
        <div className="mt-4">{common}</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ActionCard
            title="Approval pipeline"
            description="Monitor pending reviewer approvals across faculty and teams."
            actionLabel="Open pipeline"
          />
          <ActionCard
            title="Export evidence bundle"
            description="Build an evidence package for accreditation review or audit submission."
            actionLabel="Export bundle"
          />
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900">HOD / Department Head</h2>
      <p className="text-sm text-slate-600">Executive overview: health score, risk summary, and accreditation readiness.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {common}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Health Score</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{analytics.healthScore ?? 0}%</p>
          <p className="mt-2 text-sm text-slate-600">A higher score indicates better completion and accreditation readiness.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ActionCard
          title="Export accreditation package"
          description="Generate the latest accreditation evidence package for review and management."
          actionLabel="Export package"
        />
        <ActionCard
          title="View departmental health"
          description="Inspect risk signals, leaderboards, and strategic focus areas."
          actionLabel="View analytics"
        />
      </div>
    </section>
  )
}
