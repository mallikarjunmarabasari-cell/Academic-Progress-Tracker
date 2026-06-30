import { useRouter } from 'next/router'
import React from 'react'

const roles = ['Student', 'Faculty', 'Coordinator', 'HOD']

export default function RoleSelector({ defaultRole }: { defaultRole?: string }) {
  const router = useRouter()

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value
    router.push(`/role-dashboard?role=${encodeURIComponent(role)}`)
  }

  return (
    <div className="inline-flex items-center gap-3">
      <label className="text-sm text-slate-600">View as</label>
      <select
        value={defaultRole ?? 'Student'}
        onChange={onChange}
        className="rounded-md border-slate-200 bg-white px-3 py-2 text-sm"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  )
}
