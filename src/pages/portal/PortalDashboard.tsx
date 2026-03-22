import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import { usePortalSettingsWithShop } from '@/hooks/usePortalSettingsWithShop'
import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export function PortalDashboard() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, loading, customerName, signOut } = usePortalAuth(slug)
  const { settings, loading: settingsLoading } = usePortalSettingsWithShop(slug)
  const [loggingOut, setLoggingOut] = useState(false)

  // Update browser title
  useEffect(() => {
    if (settings?.shop_name) {
      document.title = `${settings.shop_name} - حسابي`
    }
  }, [settings?.shop_name])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(`/shop/${slug}/login`, { replace: true })
    }
  }, [isAuthenticated, loading, slug, navigate])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
      toast.success('تم تسجيل الخروج بنجاح')
      navigate(`/shop/${slug}`, { replace: true })
    } catch (err) {
      toast.error('خطأ في تسجيل الخروج')
      setLoggingOut(false)
    }
  }

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
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">مرحباً {customerName}</h1>
            {settings && <p className="text-white/70 text-lg">{settings.shop_name}</p>}
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded hover:bg-red-500/30 transition disabled:opacity-50"
          >
            <LogOut size={18} />
            {loggingOut ? 'جاري...' : 'خروج'}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate(`/shop/${slug}/bookings`)}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6 hover:border-blue-500/60 transition transform hover:scale-105"
          >
            <div className="text-5xl mb-3">📅</div>
            <h3 className="font-bold mb-2 text-lg">احجز موعد</h3>
            <p className="text-sm text-white/70">احجز الآن</p>
          </button>

          <button
            onClick={() => navigate(`/shop/${slug}/history`)}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6 hover:border-green-500/60 transition transform hover:scale-105"
          >
            <div className="text-5xl mb-3">📊</div>
            <h3 className="font-bold mb-2 text-lg">السجل</h3>
            <p className="text-sm text-white/70">مواعيدك السابقة</p>
          </button>

          <button
            onClick={() => navigate(`/shop/${slug}/profile`)}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 transition transform hover:scale-105"
          >
            <div className="text-5xl mb-3">👤</div>
            <h3 className="font-bold mb-2 text-lg">البيانات</h3>
            <p className="text-sm text-white/70">معلوماتك الشخصية</p>
          </button>
        </div>

        {/* Welcome Section */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">مرحباً بك في محل {settings?.shop_name}</h2>
          <p className="text-white/70 mb-4">
            {settings?.welcome_message || 'نسعد بخدمتك! استخدم التطبيق لحجز مواعيدك بسهولة'}
          </p>
          <ul className="space-y-2 text-white/70">
            <li>✓ احجز مواعيدك بسهولة وسرعة</li>
            <li>✓ تابع سجل جميع مواعيدك</li>
            <li>✓ احصل على تذكيرات تلقائية</li>
            <li>✓ دعم عملاء متخصص على مدار الساعة</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
