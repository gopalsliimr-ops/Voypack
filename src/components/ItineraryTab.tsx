'use client'
import type { ItineraryDay } from '@/lib/mock-data'

interface ItineraryTabProps {
  days: ItineraryDay[]
  readonly?: boolean
}

export default function ItineraryTab({ days, readonly = false }: ItineraryTabProps) {
  return (
    <div className="space-y-6">
      {days.map((day) => (
        <div key={day.date}>
          {/* Day header */}
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide py-2">
            {day.label}
          </p>

          {/* Activities timeline */}
          <div className="relative pl-6">
            {/* Left timeline border */}
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-indigo-200" />

            <div className="space-y-3">
              {day.activities.map((activity) => (
                <div key={activity.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-4 top-3.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />

                  {/* Activity card */}
                  <div className="bg-white rounded-xl shadow-sm p-3 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-0.5">{activity.time}</p>
                    <p className="font-medium text-slate-900 text-sm">{activity.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      📍 {activity.location}
                    </p>
                    {activity.note && (
                      <p className="text-xs text-slate-400 italic mt-1">{activity.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Activity button */}
          {!readonly && (
            <button className="mt-3 w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-indigo-600 font-medium hover:border-indigo-300 hover:bg-indigo-50 transition-colors min-h-[44px]">
              + Add Activity
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
