import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * After Google auth, if the user arrived via an invite link, localStorage holds
 * 'pending_trip_join' = tripId. This hook adds them to the trip and redirects.
 */
export function usePendingTripJoin(userId: string) {
  const router = useRouter()

  useEffect(() => {
    if (!userId) return
    const tripId = localStorage.getItem('pending_trip_join')
    if (!tripId) return

    async function join() {
      localStorage.removeItem('pending_trip_join')
      const supabase = createClient()
      await supabase
        .from('trip_members')
        .upsert({ trip_id: tripId, user_id: userId, role: 'member' }, { onConflict: 'trip_id,user_id' })
      router.replace(`/trips/${tripId}`)
    }

    join()
  }, [userId, router])
}
