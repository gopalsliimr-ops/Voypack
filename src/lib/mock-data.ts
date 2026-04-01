export interface Activity {
  id: string
  time: string
  title: string
  location: string
  note?: string
  duration?: string
  voteCount?: number
  voted?: boolean
}

export interface ItineraryDay {
  date: string
  label: string
  activities: Activity[]
}

export interface Expense {
  id: string
  title: string
  amount: number
  paidBy: string
  splitBetween: string[]
  date: string
  category: 'food' | 'transport' | 'activities' | 'stay' | 'other'
  splitType: 'equal' | 'custom' | 'subgroup'
  excludedMembers?: string[]
}

export interface Member {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Member'
  initials: string
  color: string
}

export interface TripulseResponse {
  memberId: string
  status: 'yes' | 'maybe' | 'no' | 'awaiting'
}

export interface BudgetZone {
  min: number
  median: number
  max: number
  spread: 'tight' | 'moderate' | 'wide'
}

export interface Destination {
  id: string
  name: string
  country: string
  matchPct: number
  budgetPerDay: string
  travelTime: string
  why: string
  votes: number
}

export interface TripBondPayment {
  memberId: string
  paid: boolean
  date?: string
}

export interface TripDNAInsight {
  emoji: string
  text: string
}

export interface ArrivalWindow {
  time: string
  members: string[]
}

export interface DayArchDay {
  date: string
  label: string
  tag?: string
  activities: Activity[]
}

export interface Settlement {
  from: string
  to: string
  amount: number
  settled: boolean
}

export interface TripMemory {
  daysFromIdeaToTrip: number
  activitiesCompleted: number
  favouriteActivity: string
  allSettled: boolean
}

export interface Trip {
  id: string
  name: string
  destination?: string
  startDate?: string
  endDate?: string
  status: 'Upcoming' | 'Past'
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7
  coverGradient: string
  timeframe: string
  groupSize: number
  members: Member[]
  itinerary: ItineraryDay[]
  expenses: Expense[]
  tripulse?: {
    responses: TripulseResponse[]
    threshold: number
  }
  budgetBlind?: {
    responsesReceived: number
    threshold: number
    revealed: boolean
    tripDays: number
    zone?: BudgetZone
  }
  vibeMatcher?: {
    responsesReceived: number
    threshold: number
    destinations: Destination[]
    confirmed?: string
  }
  tripBond?: {
    amount: number
    totalTarget: number
    collected: number
    threshold: number
    deadline: string
    daysRemaining: number
    payments: TripBondPayment[]
  }
  tripDNA?: {
    responsesReceived: number
    threshold: number
    insights: TripDNAInsight[]
  }
  dayArch?: {
    built: boolean
    confirmed: boolean
    days: DayArchDay[]
  }
  landTogether?: {
    responsesReceived: number
    arrivals: ArrivalWindow[]
    notConfirmed: string[]
    recommendedGroupStart: string
  }
  fairPot?: {
    totalSpend: number
    settlements: Settlement[]
  }
  tripMemory?: TripMemory
}

export const TRIPS: Trip[] = [
  {
    id: 'goa-2026',
    name: 'Goa with the Boys',
    destination: 'South Goa, India',
    startDate: '2026-10-30',
    endDate: '2026-11-04',
    status: 'Upcoming',
    stage: 6,
    coverGradient: 'from-orange-400 to-rose-500',
    timeframe: 'October 2026',
    groupSize: 8,
    members: [
      { id: 'm1', name: 'Gopal', email: 'gopal@example.com', role: 'Owner', initials: 'G', color: 'bg-indigo-500' },
      { id: 'm2', name: 'Akhil', email: 'akhil@example.com', role: 'Member', initials: 'A', color: 'bg-emerald-500' },
      { id: 'm3', name: 'Varun', email: 'varun@example.com', role: 'Member', initials: 'V', color: 'bg-amber-500' },
      { id: 'm4', name: 'Harshit', email: 'harshit@example.com', role: 'Member', initials: 'H', color: 'bg-pink-500' },
      { id: 'm5', name: 'Shardul', email: 'shardul@example.com', role: 'Member', initials: 'S', color: 'bg-cyan-500' },
      { id: 'm6', name: 'Rahul', email: 'rahul@example.com', role: 'Member', initials: 'R', color: 'bg-violet-500' },
      { id: 'm7', name: 'Vijay', email: 'vijay@example.com', role: 'Member', initials: 'Vi', color: 'bg-teal-500' },
      { id: 'm8', name: 'Yash', email: 'yash@example.com', role: 'Member', initials: 'Y', color: 'bg-orange-500' },
    ],
    tripulse: {
      responses: [
        { memberId: 'm1', status: 'yes' },
        { memberId: 'm2', status: 'yes' },
        { memberId: 'm3', status: 'yes' },
        { memberId: 'm4', status: 'yes' },
        { memberId: 'm5', status: 'yes' },
        { memberId: 'm6', status: 'maybe' },
        { memberId: 'm7', status: 'awaiting' },
        { memberId: 'm8', status: 'awaiting' },
      ],
      threshold: 70,
    },
    vibeMatcher: {
      responsesReceived: 6,
      threshold: 80,
      destinations: [
        {
          id: 'd1',
          name: 'South Goa',
          country: 'India',
          matchPct: 87,
          budgetPerDay: '₹1,000–1,400',
          travelTime: '1h 20m avg',
          why: '4 beach votes + 3 social votes. Candolim and Palolem fit both.',
          votes: 5,
        },
        {
          id: 'd2',
          name: 'Pondicherry',
          country: 'India',
          matchPct: 71,
          budgetPerDay: '₹800–1,200',
          travelTime: '6h drive or 1h 30m flight',
          why: 'Quieter beach + culture option for the chill majority.',
          votes: 1,
        },
        {
          id: 'd3',
          name: 'Lonavala',
          country: 'India',
          matchPct: 62,
          budgetPerDay: '₹700–1,000',
          travelTime: '2–4h drive',
          why: 'Budget-friendly hills; accessible for Pune members.',
          votes: 1,
        },
      ],
      confirmed: 'd1',
    },
    tripBond: {
      amount: 1500,
      totalTarget: 12000,
      collected: 9000,
      threshold: 80,
      deadline: 'Oct 21, 2026',
      daysRemaining: 5,
      payments: [
        { memberId: 'm1', paid: true, date: 'Oct 14' },
        { memberId: 'm2', paid: true, date: 'Oct 14' },
        { memberId: 'm3', paid: true, date: 'Oct 15' },
        { memberId: 'm4', paid: true, date: 'Oct 15' },
        { memberId: 'm5', paid: true, date: 'Oct 16' },
        { memberId: 'm6', paid: true, date: 'Oct 16' },
        { memberId: 'm7', paid: false },
        { memberId: 'm8', paid: false },
      ],
    },
    tripDNA: {
      responsesReceived: 6,
      threshold: 80,
      insights: [
        { emoji: '🥗', text: '1 vegetarian — all restaurant suggestions include confirmed veg options' },
        { emoji: '😴', text: '3 members need to recharge — Day 3 has a 3-hour unstructured rest slot' },
        { emoji: '🏄', text: 'Majority must-do: Water sports (3 members) → anchored to Day 2 morning' },
        { emoji: '🚫', text: '1 must-avoid: Crowded tourist spots → flagged for curation' },
      ],
    },
    dayArch: {
      built: true,
      confirmed: false,
      days: [
        {
          date: '2026-10-30',
          label: 'Day 1 — Oct 30',
          tag: 'Arrival Day',
          activities: [
            { id: 'a1', time: '6:00 PM', title: 'Baga Beach Sunset', location: 'Baga Beach, North Goa', note: 'Group meets here after everyone arrives', duration: '2 hours', voteCount: 7, voted: true },
            { id: 'a2', time: '8:30 PM', title: "Dinner at Britto's", location: 'Baga Road', note: 'Veg options confirmed', duration: '1.5 hours', voteCount: 6, voted: true },
          ],
        },
        {
          date: '2026-10-31',
          label: 'Day 2 — Oct 31',
          tag: 'Adventure Day',
          activities: [
            { id: 'a3', time: '9:00 AM', title: 'Water Sports at Calangute', location: 'Calangute Beach', duration: '3 hours', voteCount: 5, voted: true },
            { id: 'a4', time: '1:00 PM', title: 'Lunch at Infantaria Bakery', location: 'Calangute', duration: '1 hour', voteCount: 6, voted: true },
            { id: 'a5', time: '3:30 PM', title: 'Fort Aguada', location: 'Sinquerim, North Goa', note: '₹20 entry. Sea views + history.', duration: '1.5 hours', voteCount: 4, voted: false },
          ],
        },
        {
          date: '2026-11-01',
          label: 'Day 3 — Nov 1',
          tag: 'Recharge Day',
          activities: [
            { id: 'a6', time: '11:00 AM', title: 'Anjuna Flea Market', location: 'Anjuna Beach', duration: '2 hours', voteCount: 5, voted: true },
            { id: 'a7', time: '3:00 PM', title: 'Free Time / Rest', location: 'Airbnb', note: '90-min buffer built in', duration: '3 hours', voteCount: 8, voted: true },
          ],
        },
        {
          date: '2026-11-02',
          label: 'Day 4 — Nov 2',
          activities: [
            { id: 'a8', time: '10:00 AM', title: 'Dudhsagar Falls Day Trip', location: 'Sanguem, South Goa', duration: '6 hours', voteCount: 6, voted: true },
            { id: 'a9', time: '8:00 PM', title: 'Silent Noise Party', location: 'Palolem Beach', note: 'LocalLens pick 🌟', duration: '3 hours', voteCount: 7, voted: true },
          ],
        },
        {
          date: '2026-11-03',
          label: 'Day 5 — Nov 3',
          tag: 'Last Day',
          activities: [
            { id: 'a10', time: '10:00 AM', title: 'Spice Plantation Tour', location: 'Ponda, Goa', duration: '2 hours', voteCount: 4, voted: false },
            { id: 'a11', time: '1:00 PM', title: "Farewell Lunch at Fisherman's Wharf", location: 'Cavelossim, South Goa', duration: '1.5 hours', voteCount: 7, voted: true },
          ],
        },
      ],
    },
    landTogether: {
      responsesReceived: 7,
      arrivals: [
        { time: 'By 2:00 PM', members: ['Gopal', 'Akhil', 'Harshit'] },
        { time: 'By 3:30 PM', members: ['Shardul'] },
        { time: 'By 4:45 PM', members: ['Varun', 'Rahul'] },
        { time: 'By 5:30 PM', members: ['Vijay'] },
      ],
      notConfirmed: ['Yash'],
      recommendedGroupStart: '5:30 PM',
    },
    itinerary: [],
    expenses: [
      { id: 'e1', title: 'Airbnb - 5 nights', amount: 32000, paidBy: 'Gopal', splitBetween: ['Gopal', 'Akhil', 'Varun', 'Harshit', 'Shardul', 'Rahul', 'Vijay', 'Yash'], date: 'Oct 30', category: 'stay', splitType: 'equal' },
      { id: 'e2', title: "Britto's Restaurant", amount: 5800, paidBy: 'Akhil', splitBetween: ['Gopal', 'Akhil', 'Varun', 'Harshit', 'Shardul', 'Vijay', 'Yash'], date: 'Oct 30', category: 'food', splitType: 'custom', excludedMembers: ['Rahul'] },
      { id: 'e3', title: 'Water Sports at Calangute', amount: 9600, paidBy: 'Varun', splitBetween: ['Gopal', 'Akhil', 'Varun', 'Harshit', 'Shardul', 'Rahul', 'Vijay', 'Yash'], date: 'Oct 31', category: 'activities', splitType: 'equal' },
      { id: 'e4', title: 'Fort Aguada entry + taxi', amount: 2400, paidBy: 'Harshit', splitBetween: ['Gopal', 'Akhil', 'Varun', 'Harshit', 'Shardul'], date: 'Oct 31', category: 'transport', splitType: 'subgroup' },
      { id: 'e5', title: 'Dudhsagar Falls day trip', amount: 14000, paidBy: 'Gopal', splitBetween: ['Gopal', 'Akhil', 'Varun', 'Harshit', 'Shardul', 'Rahul', 'Vijay', 'Yash'], date: 'Nov 1', category: 'activities', splitType: 'equal' },
      { id: 'e6', title: 'Silent Noise Party tickets', amount: 6400, paidBy: 'Shardul', splitBetween: ['Gopal', 'Akhil', 'Varun', 'Harshit', 'Shardul', 'Vijay', 'Yash'], date: 'Nov 2', category: 'activities', splitType: 'subgroup' },
      { id: 'e7', title: 'Farewell lunch', amount: 8200, paidBy: 'Akhil', splitBetween: ['Gopal', 'Akhil', 'Varun', 'Harshit', 'Shardul', 'Rahul', 'Vijay', 'Yash'], date: 'Nov 3', category: 'food', splitType: 'equal' },
    ],
    fairPot: {
      totalSpend: 78400,
      settlements: [
        { from: 'Varun', to: 'Gopal', amount: 6000, settled: true },
        { from: 'Rahul', to: 'Akhil', amount: 1200, settled: true },
        { from: 'Vijay', to: 'Gopal', amount: 4800, settled: false },
        { from: 'Yash', to: 'Shardul', amount: 2100, settled: false },
      ],
    },
    tripMemory: {
      daysFromIdeaToTrip: 18,
      activitiesCompleted: 11,
      favouriteActivity: 'Silent Noise Party at Palolem Beach',
      allSettled: false,
    },
  },
  {
    id: 'shimla-2026',
    name: 'Shimla Winter Trip',
    destination: 'Shimla, Himachal Pradesh',
    startDate: '2026-12-22',
    endDate: '2026-12-27',
    status: 'Upcoming',
    stage: 5,
    coverGradient: 'from-blue-400 to-cyan-500',
    timeframe: 'December 2026',
    groupSize: 6,
    members: [
      { id: 's1', name: 'Gopal', email: 'gopal@example.com', role: 'Owner', initials: 'G', color: 'bg-indigo-500' },
      { id: 's2', name: 'Priya', email: 'priya@example.com', role: 'Member', initials: 'P', color: 'bg-pink-500' },
      { id: 's3', name: 'Rahul', email: 'rahul@example.com', role: 'Member', initials: 'R', color: 'bg-violet-500' },
      { id: 's4', name: 'Akhil', email: 'akhil@example.com', role: 'Member', initials: 'A', color: 'bg-emerald-500' },
      { id: 's5', name: 'Kavya', email: 'kavya@example.com', role: 'Member', initials: 'K', color: 'bg-amber-500' },
      { id: 's6', name: 'Dev', email: 'dev@example.com', role: 'Member', initials: 'D', color: 'bg-teal-500' },
    ],
    tripBond: {
      amount: 2000,
      totalTarget: 12000,
      collected: 6000,
      threshold: 80,
      deadline: 'Nov 30, 2026',
      daysRemaining: 12,
      payments: [
        { memberId: 's1', paid: true, date: 'Nov 18' },
        { memberId: 's2', paid: true, date: 'Nov 18' },
        { memberId: 's3', paid: true, date: 'Nov 19' },
        { memberId: 's4', paid: false },
        { memberId: 's5', paid: false },
        { memberId: 's6', paid: false },
      ],
    },
    vibeMatcher: {
      responsesReceived: 0,
      threshold: 80,
      destinations: [],
    },
    itinerary: [],
    expenses: [],
  },
  {
    id: 'bali-2024',
    name: 'Bali Escape',
    destination: 'Bali, Indonesia',
    startDate: '2024-06-10',
    endDate: '2024-06-17',
    status: 'Upcoming',
    stage: 6,
    coverGradient: 'from-orange-400 to-pink-500',
    timeframe: 'June 2024',
    groupSize: 3,
    members: [
      { id: 'b1', name: 'Gopal', email: 'gopal@example.com', role: 'Owner', initials: 'G', color: 'bg-indigo-500' },
      { id: 'b2', name: 'Priya', email: 'priya@example.com', role: 'Member', initials: 'P', color: 'bg-pink-500' },
      { id: 'b3', name: 'Arjun', email: 'arjun@example.com', role: 'Member', initials: 'A', color: 'bg-emerald-500' },
    ],
    itinerary: [
      {
        date: '2024-06-10',
        label: 'Day 1 — Jun 10',
        activities: [
          {
            id: 'a1',
            time: '10:00 AM',
            title: 'Arrive at Ngurah Rai Airport',
            location: 'Denpasar, Bali',
            note: 'Grab a Blue Bird taxi to the villa',
          },
          {
            id: 'a2',
            time: '2:00 PM',
            title: 'Check-in & Pool Time',
            location: 'Seminyak Villa',
          },
          {
            id: 'a3',
            time: '7:00 PM',
            title: 'Sunset Dinner at Ku De Ta',
            location: 'Seminyak Beach',
            note: 'Reservation under Gopal, confirm 48h before',
          },
        ],
      },
      {
        date: '2024-06-11',
        label: 'Day 2 — Jun 11',
        activities: [
          {
            id: 'a4',
            time: '8:00 AM',
            title: 'Tegallalang Rice Terraces',
            location: 'Ubud, Bali',
            note: 'Wear comfortable shoes, it gets muddy',
          },
          {
            id: 'a5',
            time: '12:30 PM',
            title: 'Lunch at Locavore',
            location: 'Ubud',
          },
        ],
      },
    ],
    expenses: [
      {
        id: 'e1',
        title: 'Villa Seminyak (4 nights)',
        amount: 480,
        paidBy: 'Gopal',
        splitBetween: ['Gopal', 'Priya', 'Arjun'],
        date: '2024-06-10',
        category: 'stay',
        splitType: 'equal',
      },
      {
        id: 'e2',
        title: 'Sunset Dinner',
        amount: 135,
        paidBy: 'Priya',
        splitBetween: ['Gopal', 'Priya', 'Arjun'],
        date: '2024-06-10',
        category: 'food',
        splitType: 'equal',
      },
      {
        id: 'e3',
        title: 'Scooter Rentals',
        amount: 60,
        paidBy: 'Arjun',
        splitBetween: ['Gopal', 'Priya', 'Arjun'],
        date: '2024-06-11',
        category: 'activities',
        splitType: 'equal',
      },
    ],
  },
  {
    id: 'paris-2023',
    name: 'Paris Getaway',
    destination: 'Paris, France',
    startDate: '2023-09-05',
    endDate: '2023-09-10',
    status: 'Past',
    stage: 7,
    coverGradient: 'from-blue-400 to-indigo-500',
    timeframe: 'September 2023',
    groupSize: 2,
    members: [
      { id: 'p1', name: 'Gopal', email: 'gopal@example.com', role: 'Owner', initials: 'G', color: 'bg-indigo-500' },
      { id: 'p2', name: 'Sara', email: 'sara@example.com', role: 'Member', initials: 'S', color: 'bg-rose-500' },
    ],
    itinerary: [
      {
        date: '2023-09-05',
        label: 'Day 1 — Sep 5',
        activities: [
          {
            id: 'f1',
            time: '11:00 AM',
            title: 'Arrive at CDG',
            location: 'Charles de Gaulle Airport',
            note: 'RER B direct to city center',
          },
          {
            id: 'f2',
            time: '3:00 PM',
            title: 'Eiffel Tower Visit',
            location: 'Champ de Mars, Paris',
            note: 'Pre-booked tickets, 2nd floor access',
          },
        ],
      },
      {
        date: '2023-09-06',
        label: 'Day 2 — Sep 6',
        activities: [
          {
            id: 'f3',
            time: '9:00 AM',
            title: 'Louvre Museum',
            location: 'Rue de Rivoli, Paris',
          },
          {
            id: 'f4',
            time: '1:00 PM',
            title: 'Lunch at Café Marly',
            location: 'Louvre Courtyard',
          },
        ],
      },
    ],
    expenses: [
      {
        id: 'g1',
        title: 'Hotel Le Marais (5 nights)',
        amount: 750,
        paidBy: 'Gopal',
        splitBetween: ['Gopal', 'Sara'],
        date: '2023-09-05',
        category: 'stay',
        splitType: 'equal',
      },
      {
        id: 'g2',
        title: 'Eiffel Tower Tickets',
        amount: 54,
        paidBy: 'Sara',
        splitBetween: ['Gopal', 'Sara'],
        date: '2023-09-05',
        category: 'activities',
        splitType: 'equal',
      },
    ],
  },
]

export function getTripById(id: string): Trip | undefined {
  return TRIPS.find((trip) => trip.id === id)
}
