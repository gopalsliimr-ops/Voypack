import Link from 'next/link'

const features = [
  {
    icon: '🗺',
    title: 'Plan',
    description: 'Build day-by-day itineraries for every trip',
  },
  {
    icon: '🔗',
    title: 'Share',
    description: 'Invite friends and share a live itinerary link',
  },
  {
    icon: '💸',
    title: 'Split',
    description: 'Track expenses and see who owes what',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="font-bold text-lg text-slate-900">✈ TripSync</span>
        <Link
          href="/auth"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Sign In →
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-indigo-50 to-white px-6 text-center">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
          <span className="text-indigo-600">Plan Together.</span>
          <br />
          <span className="text-slate-900">Travel Better.</span>
        </h1>
        <p className="mt-4 text-slate-500 text-base max-w-xs leading-relaxed">
          Create trips, share itineraries, and split expenses — all in one place.
        </p>
        <Link
          href="/auth"
          className="mt-8 inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full px-8 py-4 text-base transition-colors shadow-md shadow-indigo-200 min-h-[56px]"
        >
          Start Planning →
        </Link>
        <p className="mt-3 text-xs text-slate-400">No account needed to explore</p>
      </section>

      {/* Feature strip */}
      <section className="px-4 py-10">
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex-none w-52 snap-start md:w-auto bg-slate-50 rounded-2xl p-5 border border-slate-100"
            >
              <span className="text-3xl">{feature.icon}</span>
              <p className="mt-3 font-semibold text-slate-900 text-sm">{feature.title}</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-xs text-slate-400">© 2024 TripSync</p>
      </footer>
    </div>
  )
}
