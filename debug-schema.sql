-- ============================================================================
-- DEBUG: INSPECT ACTUAL DATABASE SCHEMA
-- ============================================================================
-- Purpose: Get REAL column names from live database, not assumptions

-- Step 1: Get bookings table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Step 2: Get sample bookings data (first 3 rows)
SELECT * FROM bookings LIMIT 3;

-- Step 3: Check what service-related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name ILIKE '%service%'
ORDER BY table_name;

-- Step 4: If services table exists, get its schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'services'
ORDER BY ordinal_position;

-- Step 5: Check for any other booking-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name ILIKE '%booking%'
ORDER BY table_name;

-- Step 6: Get customer_bookings schema (if exists)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_bookings'
ORDER BY ordinal_position;
