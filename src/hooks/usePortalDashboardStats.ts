import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/db/supabase'

export interface DashboardStats {
  totalVisits: number
  totalSpent: number
  nextBooking?: {
    id: string
    bookingDate: string
    bookingTime: string
    serviceName: string
  }
  lastVisit?: string
  upcomingBookingsCount: number
}

export function usePortalDashboardStats(shopId?: string, customerId?: string) {
  const [stats, setStats] = useState<DashboardStats>({
    totalVisits: 0,
    totalSpent: 0,
    upcomingBookingsCount: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!customerId || !shopId) return

    setLoading(true)
    try {
      // Get total visits and spent from visit_logs
      const { data: visitLogs, error: visitErr } = await supabase
        .from('visit_logs')
        .select('amount_paid, visit_date')
        .eq('customer_user_id', customerId)
        .eq('shop_id', shopId)
        .eq('status', 'completed')

      if (visitErr) throw visitErr

      const totalVisits = visitLogs?.length || 0
      const totalSpent = visitLogs?.reduce((sum, log) => sum + (log.amount_paid || 0), 0) || 0
      const lastVisit = visitLogs && visitLogs.length > 0 
        ? visitLogs[0]?.visit_date 
        : undefined

      // Get next upcoming booking
      const now = new Date().toISOString().split('T')[0]
      const { data: nextBookings, error: bookingErr } = await supabase
        .from('customer_bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          service_id,
          services(nameAr)
        `)
        .eq('customer_user_id', customerId)
        .eq('shop_id', shopId)
        .eq('status', 'pending')
        .gte('booking_date', now)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true })
        .limit(1)

      if (bookingErr) throw bookingErr

      // Get all upcoming bookings count
      const { data: allUpcoming, error: countErr } = await supabase
        .from('customer_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('customer_user_id', customerId)
        .eq('shop_id', shopId)
        .eq('status', 'pending')
        .gte('booking_date', now)

      if (countErr) throw countErr

      const nextBooking = nextBookings && nextBookings.length > 0 
        ? {
            id: nextBookings[0].id,
            bookingDate: nextBookings[0].booking_date,
            bookingTime: nextBookings[0].booking_time,
            serviceName: (nextBookings[0].services as any)?.nameAr || 'خدمة'
          }
        : undefined

      setStats({
        totalVisits,
        totalSpent,
        nextBooking,
        lastVisit,
        upcomingBookingsCount: allUpcoming?.length || 0
      })
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError('خطأ في تحميل الإحصائيات')
    } finally {
      setLoading(false)
    }
  }, [customerId, shopId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    fetchStats
  }
}
