import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Transaction } from '../supabase'
import { getEgyptDateString } from '../../utils/egyptTime'
import toast from 'react-hot-toast'

export const useTransactions = () => {
  const { shopId } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Transform database data from lowercase to camelCase
  const transformTransactionData = (data: any[]): Transaction[] => {
    return data.map((tx: any) => ({
      id: tx.id,
      clientId: tx.clientid,
      clientName: tx.clientname,
      clientPhone: tx.clientphone,
      barberId: tx.barberid,
      barberName: tx.barbername,
      serviceType: tx.servicetype,
      amount: tx.amount,
      discount: tx.discount || 0,
      discountType: tx.discount_type || 'fixed',
      paymentMethod: tx.payment_method || 'cash',
      notes: tx.notes || '',
      date: tx.transactiondate,
      time: tx.transactiontime,
      createdAt: tx.created_at,
      updatedAt: tx.updated_at,
    }))
  }

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      if (!shopId) {
        setTransactions([])
        return
      }

      console.log('Fetching transactions from database...')
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Transactions fetched:', data?.length || 0, 'records')
      setTransactions(transformTransactionData(data || []))
      setError(null)
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [shopId])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!shopId) throw new Error('Shop ID is required')

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          clientid: transaction.clientId,
          clientname: transaction.clientName,
          clientphone: transaction.clientPhone,
          barberid: transaction.barberId,
          barbername: transaction.barberName || '',
          servicetype: transaction.serviceType || 'general',
          amount: transaction.amount || 0,
          discount: transaction.discount || 0,
          discount_type: transaction.discountType || 'fixed',
          payment_method: transaction.paymentMethod || 'cash',
          notes: transaction.notes || '',
          transactiondate: transaction.date,
          transactiontime: transaction.time,
          shop_id: shopId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      // ✅ Database trigger (log_transaction_usage) automatically logs to usage_logs
      // No need to insert here - trigger handles it automatically

      // 🔄 Auto-complete today's pending/confirmed bookings for this client
      try {
        const clientPhone = transaction.clientPhone
        if (clientPhone) {
          const today = new Date().toISOString().split('T')[0] // today's date
          
          // Find client's active bookings for today
          const { data: activeBookings, error: bookingErr } = await supabase
            .from('bookings')
            .select('id')
            .eq('shop_id', shopId)
            .eq('clientPhone', clientPhone)
            .in('status', ['pending', 'confirmed'])
            .gte('bookingDate', today + 'T00:00:00')
            .lte('bookingDate', today + 'T23:59:59')
            .order('bookingTime', { ascending: true })

          if (!bookingErr && activeBookings && activeBookings.length > 0) {
            // Update each booking to completed
            for (const booking of activeBookings) {
              const { error: updateErr } = await supabase
                .from('bookings')
                .update({
                  status: 'completed',
                  updatedAt: new Date().toISOString()
                })
                .eq('id', booking.id)
              
              if (updateErr) {
                console.warn('⚠️ Warning: Failed to complete booking:', booking.id, updateErr)
              }
            }
            console.log(`✅ Auto-completed ${activeBookings.length} booking(s) for client ${clientPhone}`)
          }
        }
      } catch (bookingErr) {
        console.warn('⚠️ Warning: Error auto-completing bookings:', bookingErr)
        // Don't throw - transaction should succeed even if booking completion fails
      }

      await fetchTransactions()
      return data?.[0]
    } catch (err: any) {
      toast.error(err.message)
      throw err
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchTransactions()
    } catch (err: any) {
      toast.error(err.message)
      throw err
    }
  }

  const getTransactionsByDate = async (date: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('shop_id', shopId)
        .eq('transactiondate', date)
        .order('transactiontime', { ascending: false })

      if (error) throw error
      return transformTransactionData(data || [])
    } catch (err: any) {
      toast.error(err.message)
      return []
    }
  }

  const getTransactionsByClientId = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('shop_id', shopId)
        .eq('clientid', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return transformTransactionData(data || [])
    } catch (err: any) {
      toast.error(err.message)
      return []
    }
  }

  const getTodayRevenue = async () => {
    try {
      const today = getEgyptDateString()
      const { data, error } = await supabase
        .from('transactions')
        .select('total')
        .eq('date', today)

      if (error) throw error
      return data?.reduce((sum: number, t: any) => sum + (t.total || 0), 0) || 0
    } catch (err: any) {
      toast.error(err.message)
      return 0
    }
  }

  const getRevenueForDateRange = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('total, date')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err: any) {
      toast.error(err.message)
      return []
    }
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    getTransactionsByDate,
    getTransactionsByClientId,
    getTodayRevenue,
    getRevenueForDateRange,
  }
}
