import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Barber } from '../supabase'
import toast from 'react-hot-toast'

export const useBarbers = () => {
  const { shopId } = useAuth()
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBarbers = async () => {
    try {
      setLoading(true)
      if (!shopId) {
        setBarbers([])
        return
      }

      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('shop_id', shopId)
        .order('createdAt', { ascending: false })

      if (error) throw error
      setBarbers(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBarbers()
  }, [shopId])

  const addBarber = async (barber: Omit<Barber, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!shopId) throw new Error('Shop ID is required')

      const { data, error } = await supabase
        .from('barbers')
        .insert({
          ...barber,
          shop_id: shopId,
          active: true,
        })
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setBarbers([data[0], ...barbers])
        toast.success('تم إضافة الحلاق بنجاح')
        return data[0]
      }
    } catch (err: any) {
      toast.error(err.message)
      throw err
    }
  }

  const updateBarber = async (id: string, barber: Partial<Barber>) => {
    try {
      if (!shopId) throw new Error('Shop ID is required')

      const { data, error } = await supabase
        .from('barbers')
        .update(barber)
        .eq('id', id)
        .eq('shop_id', shopId)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setBarbers(barbers.map(b => b.id === id ? data[0] : b))
        toast.success('تم تحديث بيانات الحلاق')
        return data[0]
      }
    } catch (err: any) {
      toast.error(err.message)
      throw err
    }
  }

  const deleteBarber = async (id: string) => {
    try {
      if (!shopId) throw new Error('Shop ID is required')

      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', id)
        .eq('shop_id', shopId)

      if (error) throw error

      setBarbers(barbers.filter(b => b.id !== id))
      toast.success('تم حذف الحلاق')
    } catch (err: any) {
      toast.error(err.message)
      throw err
    }
  }

  return {
    barbers,
    loading,
    error,
    fetchBarbers,
    addBarber,
    updateBarber,
    deleteBarber,
  }
}
