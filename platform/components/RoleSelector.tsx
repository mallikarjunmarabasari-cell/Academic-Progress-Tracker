import { useRouter } from 'next/router'
import React from 'react'

const roles = ['Student', 'Faculty', 'Coordinator', 'HOD']

export default function RoleSelector({ defaultRole }: { defaultRole?: string }) {
  const router = useRouter()
  const selectedRole = defaultRole || 'Student'

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value
    const nextQuery = { ...(router.query ?? {}), role }

    router.push({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true })
  }

  return (
    <div className="inline-flex items-center gap-3">
      <label className="text-sm text-slate-600">View as</label>
      <select
        value={selectedRole}
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
