'use client'

interface TabBarProps {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}

export default function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex border-b border-slate-200 bg-white">
      {tabs.map((tab) => {
        const isActive = tab === active
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors min-h-[44px] ${
              isActive
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}
