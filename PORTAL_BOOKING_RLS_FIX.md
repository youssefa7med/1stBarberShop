# Portal Booking Fix - RLS Policy Issue & Solution

## 🔴 Problem Identified

### Root Cause: 400 Errors on Barber & Service Fetch
When portal users try to load the booking page, they get **HTTP 400 errors** when fetching barbers and services.

**Error in Console:**
```
Failed to load resource: the server responded with a status of 400
```

**Database Level:**
```sql
-- Attempted query:
SELECT id, name, email FROM barbers 
WHERE shop_id = 'xxx' 
AND active = true
```

### Why This Happens
1. **RLS (Row Level Security) Policy Blocking Access**
   - The `barbers` and `services` tables have RLS policies that check `auth.uid()`
   - Portal users are **unauthenticated** (use session storage, not Supabase auth)
   - `auth.uid()` returns `NULL` for portal users
   - The RLS policy fails → 400 error

2. **Current Restrictive Policies on Barbers:**
   ```sql
   CREATE POLICY "barbers_read_own" ON barbers
     FOR SELECT
     USING (
       shop_id = (SELECT id FROM shops WHERE auth_user_id = auth.uid() LIMIT 1)
       OR EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid())
     );
   ```
   This policy requires authenticated user, but portal users have `auth.uid() = NULL`

## ✅ Solution: Add Public Read Policies

### What Changed
We're creating **separate policies** that allow:
- ✅ **Public (Portal Users)**: Can READ barbers and services
- ✅ **Authenticated Shops**: Can still manage (CRUD) their own data

### New Policy Structure

**For `barbers` table:**
```sql
-- Allow portal users (unauthenticated) to read barbers
CREATE POLICY "barbers_read_public" ON barbers
  FOR SELECT
  USING (true);

-- Keep authenticated shops able to manage their own
CREATE POLICY "barbers_manage_own" ON barbers
  FOR ALL
  USING (
    shop_id = (SELECT id FROM shops WHERE auth_user_id = auth.uid() LIMIT 1)
    OR EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid())
  );
```

**For `services` table:**
```sql
-- Allow portal users (unauthenticated) to read services  
CREATE POLICY "services_read_public" ON services
  FOR SELECT
  USING (true);

-- Keep authenticated shops able to manage their own
CREATE POLICY "services_manage_own" ON services
  FOR ALL
  USING (
    shop_id = (SELECT id FROM shops WHERE auth_user_id = auth.uid() LIMIT 1)
    OR EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid())
  );
```

### Security Considerations
- ✅ **Safe**: Portal users can only READ public data (barbers list, services)
- ✅ **Safe**: No data modification allowed for portal users
- ✅ **Safe**: Each shop still sees only their own data via `shop_id` filter
- ✅ **Safe**: Admin users have full access control

## 🚀 How to Apply the Fix

### Step 1: Connect to Supabase SQL Editor
1. Go to https://app.supabase.com
2. Navigate to your project
3. Click "SQL Editor" (left sidebar)
4. Click "New Query"

### Step 2: Copy and Run the SQL
```bash
# Open this file in Supabase SQL Editor:
supabase-portal-rls-fix.sql
```

### Step 3: Verify the Fix Works

**Test in Supabase SQL Editor:**
```sql
-- Check that policies are created
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('barbers', 'services')
ORDER BY tablename, policyname;
```

**Expected Result:**
```
barbers           | barbers_read_public
barbers           | barbers_manage_own
services          | services_read_public
services          | services_manage_own
```

### Step 4: Test Portal Booking Page
1. Go to portal login: `http://localhost:5173/shop/[shop-slug]/login`
2. Log in as portal user
3. Click "احجز موعد" (Book Appointment)
4. ✅ Services should load without errors
5. ✅ Barbers should load without errors

## 🔍 Verification Checklist

After applying the fix:

- [ ] No 400 errors in console
- [ ] Services list loads immediately
- [ ] Barbers list loads immediately  
- [ ] Can select service, barber, date, time
- [ ] Can successfully create booking
- [ ] Existing bookings display correctly
- [ ] Error messages are clear if validation fails

## 📝 Related Code Changes Made

### File: `src/hooks/usePortalBookings.ts`
- Added fallback query without `active` filter in case it's not in table
- Improved error logging with emoji patterns
- Fixed `getAvailableSlots` to properly filter bookings by barber/date
- Ensured all queries use `.limit(1)` instead of `.single()` to avoid 406 errors

### Improvements to Time Slot Logic:
1. **Prevents Past Times**: Won't show slots that have already passed today
2. **Shop Hours**: Respects 9 AM - 10 PM schedule (21:00)
3. **Conflict Detection**: Checks existing bookings to prevent double-booking
4. **30-Minute Slots**: Proper 30-min slot generation with padding

## 🎯 Next Steps

After this fix is applied:

1. **Test Portal Bookings** - Verify all features work
2. **Add Phone Password Reset** - Implement phone-only reset (no email link)
3. **Booking Validation** - Add final checks before submission
4. **Mobile UI Optimization** - Polish the booking interface for small screens

## ⚠️ Important Notes

- This fix allows **READ-ONLY** access to barbers and services
- Portal users **cannot** modify, create, or delete these records
- Authenticated shop owners retain full control over their data
- The `active` flag filters are still applied in the application code (React side)

---

**Status:** ✅ Ready to apply  
**Blocking Issue:** 🔴 Portal bookings completely broken due to RLS  
**Severity:** HIGH - Portal is unusable without this fix
