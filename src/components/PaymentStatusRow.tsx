import type { Member, TripBondPayment } from '@/lib/mock-data'

interface Props {
  member: Member
  payment: TripBondPayment
}

export default function PaymentStatusRow({ member, payment }: Props) {
  return (
    <div className="flex items-center gap-3 py-2">
      {/* Avatar */}
      <div
        className={`${member.color} w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}
      >
        {member.initials}
      </div>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{member.name}</p>
        <p className="text-xs text-slate-400 truncate">{member.email}</p>
      </div>

      {/* Status pill */}
      <div className="flex flex-col items-end flex-shrink-0">
        {payment.paid ? (
          <>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
              ✓ Paid
            </span>
            {payment.date && (
              <span className="text-xs text-slate-400 mt-0.5">{payment.date}</span>
            )}
          </>
        ) : (
          <span className="bg-slate-100 text-slate-500 text-xs font-medium px-2.5 py-1 rounded-full">
            Pending
          </span>
        )}
      </div>
    </div>
  )
}
