-- نموذج SQL لإنشاء جدول الحجوزات في Supabase
-- قم بالذهاب إلى Supabase Dashboard → SQL Editor وقم بتنفيذ:

-- حذف الجدول القديم إن وجد (اختياري): 
-- DROP TABLE IF EXISTS bookings CASCADE;

-- إنشاء الجدول (بدون RLS في البداية):
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clientId UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clientName VARCHAR(255) NOT NULL,
  clientPhone VARCHAR(20) NOT NULL,
  barberId UUID,
  barberName VARCHAR(255),
  serviceType VARCHAR(255),
  bookingTime TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 30,
  queueNumber INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إضافة constraint للـ barberId:
ALTER TABLE bookings
ADD CONSTRAINT fk_barber FOREIGN KEY (barberId) REFERENCES barbers(id) ON DELETE SET NULL;

-- إضافة indexes للبحث السريع:
CREATE INDEX IF NOT EXISTS idx_bookings_clientId ON bookings(clientId);
CREATE INDEX IF NOT EXISTS idx_bookings_barberId ON bookings(barberId);
CREATE INDEX IF NOT EXISTS idx_bookings_bookingTime ON bookings(bookingTime);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_queueNumber ON bookings(queueNumber);

-- ✅ تفعيل RLS (أمان أفضل):
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- حذف أي سياسات قديمة:
DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable write access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable update access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable delete access for all users" ON bookings;

-- إضافة سياسات آمنة (تسمح للجميع في بيئة التطوير):
CREATE POLICY "bookings_select_policy" ON bookings
    FOR SELECT USING (true);

CREATE POLICY "bookings_insert_policy" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "bookings_update_policy" ON bookings
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "bookings_delete_policy" ON bookings
    FOR DELETE USING (true);

-- التحقق من الجدول:
SELECT COUNT(*) as total_bookings FROM bookings;
