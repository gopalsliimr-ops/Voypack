import Link from 'next/link'

interface Props {
  emoji: string
  title: string
  subtitle: string
  statusLabel: string
  statusColor: 'green' | 'amber' | 'slate'
  actionLabel: string
  actionHref: string
}

const STATUS_STYLES: Record<Props['statusColor'], string> = {
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  slate: 'bg-slate-100 text-slate-500',
}

export default function PlanningTrackCard({
  emoji,
  title,
  subtitle,
  statusLabel,
  statusColor,
  actionLabel,
  actionHref,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      {/* Top row */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <span className="font-semibold text-slate-900 flex-1">{title}</span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[statusColor]}`}>
          {statusLabel}
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>

      {/* Action link */}
      <Link href={actionHref} className="text-sm text-indigo-600 font-medium mt-3 block">
        {actionLabel}
      </Link>
    </div>
  )
}
