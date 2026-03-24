-- ============================================================================
-- Update shop slug to match the URL being used
-- ============================================================================

-- Update the slug to match the URL: barber-shop-34
UPDATE shops
SET slug = 'barber-shop-34'
WHERE id = 'ef8f12b6-de83-4043-84e6-f3a386262a5e';

-- Verify it's correct
SELECT id, name, slug FROM shops;
