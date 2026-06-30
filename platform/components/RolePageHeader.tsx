import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

type Action = {
  href: string
  label: string
  variant?: 'ghost' | 'solid'
}

type Props = {
  title: string
  subtitle: string
  backHref?: string
  backLabel?: string
  actions?: Action[]
  preserveRole?: boolean
}

export default function RolePageHeader({
  title,
  subtitle,
  backHref,
  backLabel = 'Back',
  actions = [],
  preserveRole = true,
}: Props) {
  const router = useRouter()
  const role = router.query.role as string | undefined

  const resolveHref = (href: string) => {
    if (!preserveRole || !role) return href
    return `${href}?role=${encodeURIComponent(role)}`
  }

  return (
    <section className="card p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-600">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {backHref ? (
          <Link href={resolveHref(backHref)} className="text-sm text-slate-600 hover:underline">
            {backLabel}
          </Link>
        ) : null}

        {actions.map((action) => (
          <Link
            key={action.href}
            href={resolveHref(action.href)}
            className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition ${
              action.variant === 'ghost'
                ? 'border border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                : 'bg-slate-900 text-white hover:bg-slate-700'
            }`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
