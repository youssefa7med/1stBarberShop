import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/db/supabase'

export interface PortalSettingsWithShop {
  id: string
  shop_id: string
  shop_name: string
  is_active: boolean
  template_id: number
  primary_color: string
  secondary_color: string
  accent_color: string
  text_color: string
  logo_url?: string
  portal_slug: string
  welcome_message?: string
}

export function usePortalSettingsWithShop(slug?: string) {
  const [settings, setSettings] = useState<PortalSettingsWithShop | null>(null)
  const [loading, setLoading] = useState(!!slug)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async (portalSlug: string) => {
    try {
      setLoading(true)
      setError(null)

      // Join portal_settings with shops to get shop_name
      const { data, error: err } = await supabase
        .from('portal_settings')
        .select(`
          id,
          shop_id,
          is_active,
          template_id,
          primary_color,
          secondary_color,
          accent_color,
          text_color,
          logo_url,
          portal_slug,
          welcome_message,
          shops (
            id,
            name
          )
        `)
        .eq('portal_slug', portalSlug)
        .single()

      if (err) {
        console.error('Error fetching portal settings:', err)
        setError('البوربتال غير موجود')
        return null
      }

      if (!data) {
        setError('البوربتال غير موجود')
        return null
      }

      const settingsWithShop: PortalSettingsWithShop = {
        id: data.id,
        shop_id: data.shop_id,
        shop_name: (data.shops as any)?.name || 'محل',
        is_active: data.is_active,
        template_id: data.template_id,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        accent_color: data.accent_color,
        text_color: data.text_color,
        logo_url: data.logo_url,
        portal_slug: data.portal_slug,
        welcome_message: data.welcome_message,
      }

      setSettings(settingsWithShop)
      return settingsWithShop
    } catch (err) {
      console.error('Error in fetchSettings:', err)
      setError('حدث خطأ في تحميل البيانات')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (slug) {
      fetchSettings(slug)
    }
  }, [slug, fetchSettings])

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  }
}
