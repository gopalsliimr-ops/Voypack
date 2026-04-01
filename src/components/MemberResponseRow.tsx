import type { Member, TripulseResponse } from '@/lib/mock-data'

interface Props {
  member: Member
  response: TripulseResponse
}

const STATUS_CONFIG = {
  yes: { label: '✓ Yes', className: 'bg-emerald-100 text-emerald-700' },
  maybe: { label: '~ Maybe', className: 'bg-amber-100 text-amber-700' },
  no: { label: '✗ No', className: 'bg-red-100 text-red-700' },
  awaiting: { label: 'Awaiting', className: 'bg-slate-100 text-slate-500' },
}

export default function MemberResponseRow({ member, response }: Props) {
  const status = STATUS_CONFIG[response.status]

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
      >
        {member.initials}
      </div>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 leading-tight">{member.name}</p>
        <p className="text-xs text-slate-400 truncate">{member.email}</p>
      </div>

      {/* Status pill */}
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${status.className}`}
      >
        {status.label}
      </span>
    </div>
  )
}
