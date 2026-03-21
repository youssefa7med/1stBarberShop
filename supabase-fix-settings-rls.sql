-- Fix Settings Table RLS Policies
-- This ensures shops can only access their own settings

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "shops_select_own_settings" ON settings;
DROP POLICY IF EXISTS "shops_insert_own_settings" ON settings;
DROP POLICY IF EXISTS "shops_update_own_settings" ON settings;
DROP POLICY IF EXISTS "shops_delete_own_settings" ON settings;

-- Policy: Shops can SELECT only their own settings
CREATE POLICY "shops_select_own_settings" ON settings
FOR SELECT TO authenticated
USING (
  shop_id = (
    SELECT id FROM shops 
    WHERE auth_user_id = auth.uid() 
    LIMIT 1
  )
);

-- Policy: Shops can INSERT only their own settings
CREATE POLICY "shops_insert_own_settings" ON settings
FOR INSERT TO authenticated
WITH CHECK (
  shop_id = (
    SELECT id FROM shops 
    WHERE auth_user_id = auth.uid() 
    LIMIT 1
  )
);

-- Policy: Shops can UPDATE only their own settings
CREATE POLICY "shops_update_own_settings" ON settings
FOR UPDATE TO authenticated
USING (
  shop_id = (
    SELECT id FROM shops 
    WHERE auth_user_id = auth.uid() 
    LIMIT 1
  )
)
WITH CHECK (
  shop_id = (
    SELECT id FROM shops 
    WHERE auth_user_id = auth.uid() 
    LIMIT 1
  )
);

-- Policy: Shops can DELETE only their own settings (optional but recommended)
CREATE POLICY "shops_delete_own_settings" ON settings
FOR DELETE TO authenticated
USING (
  shop_id = (
    SELECT id FROM shops 
    WHERE auth_user_id = auth.uid() 
    LIMIT 1
  )
);

-- Grant select/insert/update/delete permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON settings TO authenticated;
-- This allows each shop to manage its own settings (shop_name, phone, etc.)

-- Ensure RLS is enabled
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "shops_select_own_settings" ON settings;
DROP POLICY IF EXISTS "shops_insert_own_settings" ON settings;
DROP POLICY IF EXISTS "shops_update_own_settings" ON settings;
DROP POLICY IF EXISTS "shops_delete_own_settings" ON settings;

-- Allow authenticated users to SELECT their own shop's settings
CREATE POLICY "shops_select_own_settings" ON settings
FOR SELECT TO authenticated
USING (
  shop_id = (SELECT id FROM shops WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- Allow authenticated users to INSERT settings for their own shop
CREATE POLICY "shops_insert_own_settings" ON settings
FOR INSERT TO authenticated
WITH CHECK (
  shop_id = (SELECT id FROM shops WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- Allow authenticated users to UPDATE their own shop's settings
CREATE POLICY "shops_update_own_settings" ON settings
FOR UPDATE TO authenticated
USING (
  shop_id = (SELECT id FROM shops WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- Allow authenticated users to DELETE their own shop's settings
CREATE POLICY "shops_delete_own_settings" ON settings
FOR DELETE TO authenticated
USING (
  shop_id = (SELECT id FROM shops WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- Also allow admin users (admin_users table) to manage all settings
DROP POLICY IF EXISTS "admin_manage_all_settings" ON settings;
CREATE POLICY "admin_manage_all_settings" ON settings
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid())
);
