'use client'
import type { Member } from '@/lib/mock-data'

interface MembersTabProps {
  members: Member[]
}

export default function MembersTab({ members }: MembersTabProps) {
  return (
    <div>
      {/* Members list */}
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3"
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}
            >
              {member.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm">{member.name}</p>
              <p className="text-xs text-slate-500 truncate">{member.email}</p>
            </div>

            {/* Role pill */}
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                member.role === 'Owner'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {member.role}
            </span>
          </div>
        ))}
      </div>

      {/* Invite Member button */}
      <button className="mt-4 w-full border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 font-medium rounded-xl py-3 text-sm transition-colors min-h-[44px]">
        + Invite Member
      </button>
    </div>
  )
}
