-- ============================================================================
-- ADD BIRTH_DATE COLUMN TO CLIENTS TABLE
-- ============================================================================

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birth_date DATE DEFAULT NULL;

-- Create index for birthday filtering
CREATE INDEX IF NOT EXISTS idx_clients_birth_date ON public.clients(birth_date);
