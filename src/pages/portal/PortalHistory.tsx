import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import { usePortalSettingsWithShop } from '@/hooks/usePortalSettingsWithShop'
import { ArrowRight } from 'lucide-react'

export function PortalHistory() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, loading } = usePortalAuth(slug)
  const { settings, loading: settingsLoading } = usePortalSettingsWithShop(slug)

  // Update browser title
  useEffect(() => {
    if (settings?.shop_name) {
      document.title = `${settings.shop_name} - سجل المواعيد`
    }
  }, [settings?.shop_name])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(`/shop/${slug}/login`, { replace: true })
    }
  }, [isAuthenticated, loading, slug, navigate])

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gold-400/20 border-t-gold-400 animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir="rtl">
      <div className="max-w-4xl mx-auto p-8">
        <button
          onClick={() => navigate(`/shop/${slug}/dashboard`)}
          className="flex items-center gap-2 mb-8 text-white/70 hover:text-white transition"
        >
          <ArrowRight size={20} />
          العودة للرئيسة
        </button>

        <h1 className="text-4xl font-bold mb-8">سجل المواعيد</h1>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-bold mb-2 text-white/90">لا توجد مواعيد بعد</h2>
          <p className="text-white/70">
            عندما تحجز موعداً، سيظهر هنا
          </p>
        </div>
      </div>
    </div>
  )
}
