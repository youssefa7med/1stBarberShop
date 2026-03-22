import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usePortalAuth } from '@/hooks/usePortalAuth'
import { usePortalSettingsWithShop } from '@/hooks/usePortalSettingsWithShop'
import { usePortalProfile } from '@/hooks/usePortalProfile'
import { ArrowRight, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export function PortalProfile() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  // Auth & Settings
  const { isAuthenticated, loading, customerId } = usePortalAuth(slug)
  const { settings, loading: settingsLoading } = usePortalSettingsWithShop(slug)

  // Profile data
  const { profile, loading: profileLoading, error: profileError, updateProfile, sendPhoneVerification, sendEmailVerification } = usePortalProfile(customerId || undefined)

  // Form state
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [updating, setUpdating] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)

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

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        phone: profile.phone || ''
      })
    }
  }, [profile])

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({
        name: profile?.name || '',
        phone: profile?.phone || ''
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setUpdating(true)
    try {
      const success = await updateProfile(formData.name, formData.phone)
      if (success) {
        toast.success('تم تحديث البيانات بنجاح')
        setIsEditing(false)
      } else {
        toast.error('فشل تحديث البيانات')
      }
    } catch (err) {
      toast.error('خطأ في تحديث البيانات')
    } finally {
      setUpdating(false)
    }
  }

  const handlePhoneVerification = async () => {
    if (!formData.phone) {
      toast.error('يرجى إدخال رقم الهاتف')
      return
    }

    setVerifyingPhone(true)
    try {
      const success = await sendPhoneVerification()
      if (success) {
        toast.success('تم التحقق من الهاتف بنجاح')
      } else {
        toast.error('فشل التحقق من الهاتف')
      }
    } catch (err) {
      toast.error('خطأ في التحقق من الهاتف')
    } finally {
      setVerifyingPhone(false)
    }
  }

  const handleEmailVerification = async () => {
    if (!profile?.email) {
      toast.error('لا يوجد بريد إلكتروني')
      return
    }

    setVerifyingEmail(true)
    try {
      const success = await sendEmailVerification()
      if (success) {
        toast.success('تم التحقق من البريد الإلكتروني بنجاح')
      } else {
        toast.error('فشل التحقق من البريد الإلكتروني')
      }
    } catch (err) {
      toast.error('خطأ في التحقق من البريد الإلكتروني')
    } finally {
      setVerifyingEmail(false)
    }
  }

  if (loading || settingsLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gold-400/20 border-t-gold-400 animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const primaryColor = settings?.primary_color || '#FFD700'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir="rtl">
      <div className="max-w-2xl mx-auto p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/shop/${slug}/dashboard`)}
          className="flex items-center gap-2 mb-8 text-white/70 hover:text-white transition"
        >
          <ArrowRight size={20} />
          العودة للرئيسة
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">بيانات الحساب</h1>
          <p className="text-white/60">مع {settings?.shop_name}</p>
        </div>

        {/* Error Message */}
        {profileError && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
            {profileError}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-6">
          {/* Edit Toggle Button */}
          {!isEditing && (
            <div className="flex justify-end mb-4">
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
              >
                ✎ تحرير البيانات
              </button>
            </div>
          )}

          {isEditing ? (
            <>
              {/* Edit Form */}
              <div>
                <label className="block text-sm font-bold mb-3 text-white/70">الاسم الكامل *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition"
                  placeholder="الاسم الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-white/70">رقم الهاتف *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition"
                  placeholder="رقم الهاتف"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleSave}
                  disabled={updating}
                  className="flex-1 py-3 px-4 rounded-lg font-bold text-black transition disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: primaryColor,
                    opacity: updating ? 0.5 : 1
                  }}
                >
                  <Save size={20} />
                  {updating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button
                  onClick={handleEditToggle}
                  disabled={updating}
                  className="flex-1 py-3 px-4 rounded-lg font-bold text-white bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Display Mode */}
              <div>
                <label className="block text-sm font-medium mb-3 text-white/60">الاسم الكامل</label>
                <p className="text-lg text-white font-semibold">{profile?.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-white/60">البريد الإلكتروني</label>
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-lg text-white font-semibold">{profile?.email}</p>
                    <p className="text-xs text-white/50 mt-1">
                      {profile?.email_verified ? '✓ مُتحقق' : '✗ غير مُتحقق'}
                    </p>
                  </div>
                  {!profile?.email_verified && (
                    <button
                      onClick={handleEmailVerification}
                      disabled={verifyingEmail}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 text-sm rounded transition disabled:opacity-50"
                    >
                      {verifyingEmail ? 'جاري...' : 'تحقق'}
                    </button>
                  )}
                  {profile?.email_verified && (
                    <CheckCircle size={20} className="text-green-400" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-white/60">رقم الهاتف</label>
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-lg text-white font-semibold" dir="ltr">
                      {profile?.phone || 'لم يتم إدخاله'}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      {profile?.phone_verified ? '✓ مُتحقق' : profile?.phone ? '✗ غير مُتحقق' : '-'}
                    </p>
                  </div>
                  {profile?.phone && !profile?.phone_verified && (
                    <button
                      onClick={handlePhoneVerification}
                      disabled={verifyingPhone}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 text-sm rounded transition disabled:opacity-50"
                    >
                      {verifyingPhone ? 'جاري...' : 'تحقق'}
                    </button>
                  )}
                  {profile?.phone_verified && (
                    <CheckCircle size={20} className="text-green-400" />
                  )}
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 mt-6">
                <p className="text-white/70 text-sm mb-4">
                  معلومات حسابك محفوظة بشكل آمن. يمكنك تحرير البيانات أعلاه في أي وقت.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
