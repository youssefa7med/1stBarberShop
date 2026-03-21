import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Transaction } from '../supabase'
import { getEgyptDateString, getEgyptYearMonth } from '../../utils/egyptTime'
import toast from 'react-hot-toast'

export const useTransactions = () => {
  const { shopId } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        .order('createdAt', { ascending: false })

      if (error) throw error
      console.log('Transactions fetched:', data?.length || 0, 'records')
      setTransactions(data || [])
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
          ...transaction,
          shop_id: shopId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      const transactionId = data?.[0]?.id
      if (transactionId) {
        // ✅ Log usage for billing purposes (using Egypt timezone)
        await supabase
          .from('usage_logs')
          .insert({
            shop_id: shopId,
            action_type: 'transaction',
            quantity: 1,
            reference_id: transactionId,
            billable_amount: transaction.total || 0,
            year_month: getEgyptYearMonth(), // YYYY-MM in Egypt timezone
          })
          .throwOnError()
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
        .eq('date', date)
        .order('time', { ascending: false })

      if (error) throw error
      return data || []
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
        .eq('clientId', clientId)
        .order('createdAt', { ascending: false })

      if (error) throw error
      return data || []
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
