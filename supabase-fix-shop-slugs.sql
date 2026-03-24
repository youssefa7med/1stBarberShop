-- ============================================================================
-- Fix shop slugs - Create clean, URL-safe slugs
-- ============================================================================

-- Option 1: Use shop ID as slug (most reliable for URLs)
UPDATE shops 
SET slug = id::text
WHERE slug IS NOT NULL;

-- Verify the slugs are now URL-safe
SELECT id, name, slug FROM shops;
