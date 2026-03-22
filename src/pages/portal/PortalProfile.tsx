import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import { usePortalSettingsWithShop } from '@/hooks/usePortalSettingsWithShop'
import { ArrowRight } from 'lucide-react'

export function PortalProfile() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, loading, customerName, email, phone } = usePortalAuth(slug)
  const { settings, loading: settingsLoading } = usePortalSettingsWithShop(slug)

  // Update browser title
  useEffect(() => {
    if (settings?.shop_name) {
      document.title = `${settings.shop_name} - بيانات الحساب`
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
      <div className="max-w-2xl mx-auto p-8">
        <button
          onClick={() => navigate(`/shop/${slug}/dashboard`)}
          className="flex items-center gap-2 mb-8 text-white/70 hover:text-white transition"
        >
          <ArrowRight size={20} />
          العودة للرئيسة
        </button>

        <h1 className="text-4xl font-bold mb-8">بيانات الحساب</h1>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-white/60">الاسم الكامل</label>
            <p className="text-lg text-white font-semibold">{customerName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-white/60">البريد الإلكتروني</label>
            <p className="text-lg text-white font-semibold">{email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-white/60">رقم الهاتف</label>
            <p className="text-lg text-white font-semibold">{phone || 'لم يتم إدخاله'}</p>
          </div>

          <div className="border-t border-white/10 pt-6 mt-6">
            <p className="text-white/70 text-sm mb-4">
              لتحديث بيانات حسابك، يرجى التواصل مع {settings?.shop_name} مباشرة
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
