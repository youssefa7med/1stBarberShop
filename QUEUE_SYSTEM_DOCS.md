# نظام إدارة الطابور العقلي (Smart Queue Management System) 🎯

## نظرة عامة
نظام متطور ومتقدم يعرض حالة الطابور والجلسات في الوقت الفعلي مع تحديثات ديناميكية وتصميم احترافي.

---

## المميزات الرئيسية

### 1. **عرض الطابور في الوقت الفعلي**
- **عدد الأشخاص أمامك**: عدد العملاء المنتظرين قبلك
- **الانتظار المتوقع**: مجموع الوقت المتبقي لجميع الجلسات قبلك
- **الوقت المتوقع**: وقت انتهائك وجاهزيتك للمغادرة
- **الساعة الحالية**: معروضة بالمرقم الديناميكي الحي

### 2. **الحسابات الذكية**
```javascript
// خوارزمية الحساب:

1. جلب جميع الحجوزات لاليوم بحالة "pending" أو "ongoing"
2. فرزها حسب الترتيب الزمني
3. حساب المدة المتبقية من الجلسة الحالية
4. إضافة مدد جميع الجلسات المرتقبة
5. إضافة الوقت الحالي + الوقت الإجمالي = وقت الانتهاء المتوقع
```

### 3. **التحديثات الديناميكية**
- تحديث كل **ثانية** (الساعة الحالية)
- تحديث فوري عند إضافة/تعديل حجزات جديدة
- تحديث الألوان والرسائل تلقائياً حسب الحالة

---

## هيكل المكونات

### `useQueueStatus.ts` - Hook مخصص
```typescript
export interface QueueInfo {
  peopleAhead: number       // عدد الأشخاص أمامك
  waitingMinutes: number    // دقائق الانتظار المتوقعة
  currentTime: string       // الوقت الحالي (تحديث كل ثانية)
  estimatedTime: string     // الوقت المتوقع للانتهاء
  nextBooking?: Booking     // الحجز التالي
  isWaiting: boolean        // هل هناك انتظار؟
  percentageWaited: number  // نسبة التقدم من الجلسة الحالية
}
```

**الميزات:**
- يحسب الطابور في الوقت الفعلي
- يحدث كل ثانية تلقائياً
- يوفر معلومات الحجز التالي
- يتتبع نسبة الإنجاز

### `QueueStatus.tsx` - مكون العرض الأساسي
```
├── Section: معلومات الطابور (ثلاث بطاقات)
│   ├── البطاقة الزرقاء - عدد الأشخاص أمامك
│   ├── البطاقة البرتقالية - الانتظار المتوقع
│   └── البطاقة الخضراء - الوقت المتوقع
├── Divider - الوقت الحالي الحي
├── Alert - رسالة الحالة
└── Widget Compact - نسخة صغيرة للعرض الجانبي
```

**الميزات:**
- animations سلسة مع Framer Motion
- ألوان متدرجة جذابة
- عروض رسائل ديناميكية
- دعم الاتجاه RTL/LTR

### `QueueDisplay.tsx` - صفحة العرض الكامل
```
├── Mode: Large Display (شاشة كاملة)
│   ├── عنوان الصفحة
│   ├── ثلاث بطاقات كبيرة (أحجام أكبر)
│   ├── شريط الوقت الحالي
│   ├── رسالة الحالة
│   └── تذكير بالشكر
└── Mode: Compact (جانبي)
    ├── شبكة 3 عناصر صغيرة
    └── زر التحسيب للوضع الكامل
```

**الاستخدام:**
- عرض على شاشة الاستقبال
- شاشة انتظار العملاء
- واجهة بيانات القائمة الجانبية

---

## تدفق البيانات

```
┌─────────────────────┐
│   Supabase DB       │ قاعدة البيانات
│  (bookings table)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  useBookings()      │ جلب البيانات
│  (hook)             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ useQueueStatus()    │ معالجة الحسابات
│ (hook)              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ QueueStatus.tsx     │ عرض البطاقات
│ (component)         │
└─────────────────────┘
           │
           ├─────► Dashboard / Bookings page
           └─────► QueueDisplay full screen
```

---

## الحسابات التفصيلية

### حساب عدد الأشخاص أمامك
```javascript
peopleAhead = bookings
  .filter(b => b.bookingTime > currentTime && b.status !== 'completed')
  .length
```

### حساب وقت الانتظار
```javascript
// الطريقة الذكية:
let totalMinutes = 0;

// إذا كانت جلسة جارية حالياً
if (currentBooking.status === 'ongoing') {
  const completionTime = currentBooking.startTime + currentBooking.duration;
  totalMinutes = Math.max(0, (completionTime - now) / 60000);
}

// أضف جميع الجلسات المنتظرة
futureBookings.forEach(booking => {
  totalMinutes += booking.duration;
});

estimatedTime = now + (totalMinutes * 60000);
```

### حساب النسبة (مثال)
```javascript
percentageWaited = (elapsed / totalDuration) * 100

// مثال: جلسة 30 دقيقة مرت 15 دقيقة = 50%
```

---

## التكامل مع النظام

### في صفحة الحجوزات
```typescript
// في Bookings.tsx
import { QueueStatus } from '../components/ui/QueueStatus'

// في الـ JSX:
<QueueStatus /> // عرض حي للطابور
```

### في لوحة التحكم (اختياري)
```typescript
// في Dashboard.tsx
import { QueueStatus } from '../components/ui/QueueStatus'

// يمكن إضافته كـ widget صغير
<div className="col-span-2">
  <QueueStatus />
</div>
```

### في صفحة عرض الشاشة الكاملة
```typescript
// Navigate to /queue
// يعرض واجهة كاملة مخصصة لشاشة الانتظار
```

---

## الترجمات المتاحة

### العربية (ar.json)
```json
{
  "bookings": {
    "queueAhead": "أمامك في الدور",
    "yourTurn": "دورك الآن",
    "expectedWait": "الانتظار المتوقع",
    "expectedTime": "الوقت المتوقع",
    "currentTime": "الوقت الحالي"
  }
}
```

### الإنجليزية (en.json)
```json
{
  "bookings": {
    "queueAhead": "People Ahead",
    "yourTurn": "Your Turn",
    "expectedWait": "Expected Wait",
    "expectedTime": "Expected Time",
    "currentTime": "Current Time"
  }
}
```

---

## المسارات (Routes)

| المسار | الوصف | الاستخدام |
|--------|-------|---------|
| `/queue` | عرض الطابور الكامل | شاشة الانتظار الرئيسية |
| `/bookings` | صفحة الحجوزات مع الطابور | إدارة الحجوزات + معاينة الطابور |
| `/` | Dashboard (اختياري) | عرض الطابور كـ widget صغير |

---

## الحالات الخاصة

### 1. عدم وجود حجوزات
```
رسالة: "لا يوجد انتظار حالياً. دورك الآن!"
اللون: أخضر
الأيقونة: CheckCircle2
```

### 2. جلسة جارية
```
الوقت المتبقي = نهاية الجلسة - الوقت الحالي
peopleAhead = عدد الحجوزات المتبقية
```

### 3. وقت انقضى
```
لا يتم حساب الأوقات التي مرت
فقط الجلسات المستقبلية
```

---

## نصائح الاستخدام

### ✅ أفضل الممارسات
- اضبط مدة كل خدمة بدقة في إعدادات الخدمات
- حديّث حالة الحجز (pending → ongoing → completed) بانتظام
- استخدم الشاشة الكاملة `/queue` في منطقة الانتظار
- راقب التحديثات الحية من لوحة التحكم

### ⚠️ نقاط يجب الانتباه

**أسباب عدم تحديث الطابور:**
1. عدم حفظ الحجز بشكل صحيح
2. حالة الحجز=completed (لن يُحسب)
3. وقت الحجز في الماضي
4. عدم تحديد الحلاق أو الخدمة

**كيفية الحل:**
- تأكد من حفظ الحجز (توقع رسالة نجاح)
- تحقق من حالة الحجز (يجب أن تكون pending أو ongoing)
- تأكد أن الوقت في المستقبل
- أعد تحميل الصفحة إذا لم يتحدث

---

## الميزات المتقدمة

### تحديث ديناميكي
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000); // تحديث كل ثانية
  
  return () => clearInterval(interval);
}, []);
```

### حساب الحجوزات الذكي
```typescript
// استبعاد الحجوزات المكتملة والملغاة
const activeBookings = bookings.filter(b =>
  b.status === 'pending' || b.status === 'ongoing'
);

// ترتيب الحجوزات
activeBookings.sort((a, b) =>
  new Date(a.bookingTime) - new Date(b.bookingTime)
);
```

### رسائل ديناميكية
```typescript
{
  queueInfo.isWaiting ? (
    <WaitingMessage queue={queueInfo.peopleAhead} />
  ) : (
    <ReadyMessage />
  )
}
```

---

## استكشاف الأخطاء

| المشكلة | الحل |
|--------|------|
| الطابور لا يحدّث | أعد تحميل الصفحة / تحقق من الحجوزات |
| الأرقام غير صحيحة | تحقق من مدة الخدمات والحجوزات |
| التاريخ/الوقت خاطئ | تحقق من إعدادات التوقيت (Egypt Time) |
| الواجهة لا تظهر | تحقق من توفر useQueueStatus hook |

---

## المستقبل: إضافات مخطط لها

- [ ] إشعارات صوتية عند الاقتراب من الدور
- [ ] تأثيرات بصرية عند تغيير الحالة
- [ ] حفظ إحصائيات الانتظار اليومية
- [ ] تقارير تحليلية عن أوقات الانتظار
- [ ] تنبيهات للعملاء (SMS/Email)
- [ ] تكامل مع Google Calendar

---

## الملفات المرتبطة

```
src/
├── components/
│   └── ui/
│       └── QueueStatus.tsx ⭐ المكون الرئيسي
├── db/
│   └── hooks/
│       ├── useBookings.ts 📊 جلب البيانات
│       └── useQueueStatus.ts ⭐ حسابات الطابور
├── pages/
│   ├── Bookings.tsx (مع QueueStatus)
│   └── QueueDisplay.tsx ⭐ صفحة العرض الكامل
├── locales/
│   ├── ar.json (ترجمة عربية)
│   └── en.json (ترجمة إنجليزية)
└── App.tsx (routing)
```

---

**آخر تحديث:** مارس 2026
**الإصدار:** 1.0.0
**الحالة:** الإنتاج ✅
