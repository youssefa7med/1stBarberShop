import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase, Client } from '../supabase'
import toast from 'react-hot-toast'

export const useClients = () => {
  const { shopId } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Transform database data from lowercase to camelCase
  const transformClientData = (data: any[]): Client[] => {
    return data.map((client: any) => ({
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email || null,
      birthday: client.birth_date || '',
      notes: client.notes || '',
      totalVisits: client.total_visits || 0,
      totalSpent: client.total_spent || 0,
      isVIP: client.vip || false,
      lastVisit: client.last_visit || '',
      shop_id: client.shop_id,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
    }))
  }

  const fetchClients = async () => {
    try {
      setLoading(true)
      if (!shopId) {
        setClients([])
        return
      }
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(transformClientData(data || []))
      setError(null)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [shopId])

  const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!shopId) throw new Error('Shop ID is required')
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: client.name,
          phone: client.phone,
          email: client.email || null,
          birth_date: client.birthday || null,
          notes: client.notes || '',
          total_visits: client.totalVisits,
          total_spent: client.totalSpent,
          vip: client.isVIP,
          shop_id: shopId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error
      await fetchClients()
      return data?.[0]
    } catch (err: any) {
      toast.error(err.message)
      throw err
    }
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      // Map camelCase to lowercase columns
      const dbUpdates: any = {}
      if (updates.name) dbUpdates.name = updates.name
      if (updates.phone) dbUpdates.phone = updates.phone
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.birthday !== undefined) dbUpdates.birth_date = updates.birthday || null
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes
      if (updates.totalVisits !== undefined) dbUpdates.total_visits = updates.totalVisits
      if (updates.totalSpent !== undefined) dbUpdates.total_spent = updates.totalSpent
      if (updates.isVIP !== undefined) dbUpdates.vip = updates.isVIP
      dbUpdates.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('clients')
        .update(dbUpdates)
        .eq('id', id)

      if (error) throw error
      await fetchClients()
    } catch (err: any) {
      toast.error(err.message)
      throw err
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchClients()
    } catch (err: any) {
      toast.error(err.message)
      throw err
    }
  }

  const searchClients = async (query: string) => {
    try {
      if (!query.trim()) {
        await fetchClients()
        return
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)

      if (error) throw error
      setClients(transformClientData(data || []))
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const getClientByPhone = async (phone: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', phone)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? transformClientData([data])[0] : null
    } catch (err: any) {
      throw err
    }
  }

  return {
    clients,
    loading,
    error,
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    searchClients,
    getClientByPhone,
  }
}
