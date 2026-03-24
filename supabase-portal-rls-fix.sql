-- Fix RLS policies for portal access to barbers and services
-- Allow unauthenticated portal users to read barbers and services

-- Drop old restrictive policies on barbers
DROP POLICY IF EXISTS "barbers_read_own" ON barbers;

-- Create new policy allowing public read access to barbers
CREATE POLICY "barbers_read_public" ON barbers
  FOR SELECT
  USING (true);

-- Create policy for authenticated shops to manage their own
CREATE POLICY "barbers_manage_own" ON barbers
  FOR ALL
  USING (
    shop_id = (SELECT id FROM shops WHERE auth_user_id = auth.uid() LIMIT 1)
    OR EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid())
  );

-- Drop old restrictive policies on services
DROP POLICY IF EXISTS "services_read_own" ON services;
DROP POLICY IF EXISTS "Enable read access for all users" ON services;

-- Create new policy allowing public read access to services
CREATE POLICY "services_read_public" ON services
  FOR SELECT
  USING (true);

-- Create policy for authenticated shops to manage their own
CREATE POLICY "services_manage_own" ON services
  FOR ALL
  USING (
    shop_id = (SELECT id FROM shops WHERE auth_user_id = auth.uid() LIMIT 1)
    OR EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid())
  );

-- Verify policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies
WHERE tablename IN ('barbers', 'services')
ORDER BY tablename, policyname;
