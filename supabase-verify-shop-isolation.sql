-- ============================================================================
-- DIAGNOSTIC QUERIES: Verify Shop Isolation & Phone Registration
-- ============================================================================

-- Query 1: Check which portal users are registered in which shops
-- ============================================================================
SELECT 
  pu.id,
  pu.phone,
  pu.name,
  pu.shop_id,
  s.name as shop_name,
  pu.created_at
FROM portal_users pu
LEFT JOIN shops s ON pu.shop_id = s.id
ORDER BY pu.shop_id, pu.phone;

-- Query 2: Check which clients are registered in which shops
-- ============================================================================
SELECT 
  c.id,
  c.phone,
  c.name,
  c.shop_id,
  s.name as shop_name,
  c."createdAt"
FROM clients c
LEFT JOIN shops s ON c.shop_id = s.id
ORDER BY c.shop_id, c.phone;

-- Query 3: Find which shops exist
-- ============================================================================
SELECT 
  id,
  name,
  auth_user_id,
  created_at
FROM shops
ORDER BY created_at DESC;

-- Query 4: Summary - Portal users per shop
-- ============================================================================
SELECT 
  s.name as shop_name,
  s.id as shop_id,
  COUNT(pu.id) as portal_users_count,
  STRING_AGG(pu.phone, ', ') as phone_numbers
FROM shops s
LEFT JOIN portal_users pu ON s.id = pu.shop_id
GROUP BY s.id, s.name
ORDER BY s.created_at DESC;

-- Query 5: Summary - Clients per shop
-- ============================================================================
SELECT 
  s.name as shop_name,
  s.id as shop_id,
  COUNT(c.id) as clients_count,
  STRING_AGG(c.phone, ', ') as phone_numbers
FROM shops s
LEFT JOIN clients c ON s.id = c.shop_id
GROUP BY s.id, s.name
ORDER BY s.created_at DESC;

-- Query 6: Check for phone number conflicts (same phone in multiple shops)
-- ============================================================================
SELECT 
  phone,
  COUNT(DISTINCT shop_id) as shops_count,
  STRING_AGG(DISTINCT s.name, ', ') as shop_names
FROM clients c
LEFT JOIN shops s ON c.shop_id = s.id
GROUP BY c.phone
HAVING COUNT(DISTINCT shop_id) > 1;

-- Query 7: Check for portal_users conflicts
-- ============================================================================
SELECT 
  phone,
  COUNT(DISTINCT shop_id) as shops_count,
  STRING_AGG(DISTINCT s.name, ', ') as shop_names
FROM portal_users pu
LEFT JOIN shops s ON pu.shop_id = s.id
GROUP BY pu.phone
HAVING COUNT(DISTINCT shop_id) > 1;

-- Query 8: Which phones are trying to cross-login?
-- ============================================================================
-- Example: If phone 01000139411 is in Shop A, trying to login to Shop B will fail
-- Run this to see all portal users:
SELECT 
  pu.phone,
  pu.name,
  s.name as registered_shop,
  pu.shop_id
FROM portal_users pu
LEFT JOIN shops s ON pu.shop_id = s.id
WHERE pu.phone = '01000139411';  -- Replace with phone number to check
