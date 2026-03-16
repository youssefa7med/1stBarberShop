-- نموذج SQL لإنشاء جدول الحجوزات في Supabase
-- قم بالذهاب إلى Supabase Dashboard → SQL Editor وقم بتنفيذ:

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clientId UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clientName VARCHAR(255) NOT NULL,
  clientPhone VARCHAR(20) NOT NULL,
  barberId UUID REFERENCES barbers(id) ON DELETE SET NULL,
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

-- إضافة indexes للبحث السريع:
CREATE INDEX idx_bookings_clientId ON bookings(clientId);
CREATE INDEX idx_bookings_barberId ON bookings(barberId);
CREATE INDEX idx_bookings_bookingTime ON bookings(bookingTime);
CREATE INDEX idx_bookings_status ON bookings(status);

-- تفعيل RLS (اختياري لأمان أفضل):
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for now" ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- التحقق من الجدول:
SELECT * FROM bookings LIMIT 1;
