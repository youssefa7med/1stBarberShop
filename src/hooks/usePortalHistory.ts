import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/db/supabase'

export interface VisitHistory {
  id: string
  visitDate: string
  serviceName: string
  barberName?: string
  amount: number
  notes?: string
  status: 'completed' | 'cancelled'
}

export function usePortalHistory(shopId?: string, customerId?: string) {
  const [history, setHistory] = useState<VisitHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!customerId || !shopId) return

    setLoading(true)
    try {
      // Fetch visit logs for customer
      const { data, error: err } = await supabase
        .from('visit_logs')
        .select(`
          id,
          visit_date,
          service_name,
          barber_name,
          amount_paid,
          notes,
          status
        `)
        .eq('customer_user_id', customerId)
        .eq('shop_id', shopId)
        .order('visit_date', { ascending: false })

      if (err) throw err

      setHistory(
        data?.map(log => ({
          id: log.id,
          visitDate: log.visit_date,
          serviceName: log.service_name,
          barberName: log.barber_name,
          amount: log.amount_paid || 0,
          notes: log.notes,
          status: log.status || 'completed'
        })) || []
      )
    } catch (err) {
      console.error('Error fetching history:', err)
      setError('خطأ في تحميل السجل')
    } finally {
      setLoading(false)
    }
  }, [customerId, shopId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Get stats
  const getStats = useCallback(() => {
    return {
      totalVisits: history.length,
      totalSpent: history.reduce((sum, log) => sum + log.amount, 0),
      averageSpent: history.length > 0 ? history.reduce((sum, log) => sum + log.amount, 0) / history.length : 0,
      lastVisit: history[0]?.visitDate || null
    }
  }, [history])

  return {
    history,
    loading,
    error,
    fetchHistory,
    getStats
  }
}
