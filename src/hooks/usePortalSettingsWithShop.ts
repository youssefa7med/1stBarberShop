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

      // First check if portal settings exist with this slug
      const { data: portalData, error: portalErr } = await supabase
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

      if (portalErr) {
        console.error('Error fetching portal settings:', portalErr)
        setError('البوابة غير موجودة')
        return null
      }

      if (!portalData) {
        setError('البوابة غير موجودة')
        return null
      }

      // Check if portal is active
      if (!portalData.is_active) {
        console.warn('Portal exists but is not active:', portalSlug)
        setError('البوابة معطلة حالياً')
        return null
      }

      const settingsWithShop: PortalSettingsWithShop = {
        id: portalData.id,
        shop_id: portalData.shop_id,
        shop_name: (portalData.shops as any)?.name || 'محل',
        is_active: portalData.is_active,
        template_id: portalData.template_id,
        primary_color: portalData.primary_color,
        secondary_color: portalData.secondary_color,
        accent_color: portalData.accent_color,
        text_color: portalData.text_color,
        logo_url: portalData.logo_url,
        portal_slug: portalData.portal_slug,
        welcome_message: portalData.welcome_message,
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
