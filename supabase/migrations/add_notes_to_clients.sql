-- ============================================================================
-- ADD NOTES COLUMN TO CLIENTS TABLE
-- ============================================================================

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;

-- Create index for search
CREATE INDEX IF NOT EXISTS idx_clients_notes ON public.clients(notes);
