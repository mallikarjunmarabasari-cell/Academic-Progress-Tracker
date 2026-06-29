import React from 'react'

type Props = { role: string; analytics: any }

function KPI({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
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
        <p className="text-sm text-slate-600">Personal progress, next actions, and submissions you made.</p>
        <div className="mt-4">{common}</div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">Quick actions: submit evidence, join events, request review.</div>
      </section>
    )
  }

  if (role === 'Faculty') {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-900">Faculty dashboard</h2>
        <p className="text-sm text-slate-600">Submissions to review and approvals assigned to you.</p>
        <div className="mt-4">{common}</div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">Quick actions: review submissions, approve evidence, message students.</div>
      </section>
    )
  }

  if (role === 'Coordinator') {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-900">Department Coordinator</h2>
        <p className="text-sm text-slate-600">Department-wide KPIs, pending approvals, and accreditation readiness.</p>
        <div className="mt-4">{common}</div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">Quick actions: assign reviewers, export evidence, schedule audits.</div>
      </section>
    )
  }

  // HOD
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900">HOD / Department Head</h2>
      <p className="text-sm text-slate-600">Executive overview: health score, risk summary, and accreditation readiness.</p>
      <div className="mt-4">{common}</div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">Quick actions: export accreditation package, view leaderboards, set priorities.</div>
    </section>
  )
}
