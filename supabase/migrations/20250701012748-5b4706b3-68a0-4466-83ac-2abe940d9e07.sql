
-- Add missing columns to user_addresses table
ALTER TABLE public.user_addresses 
ADD COLUMN IF NOT EXISTS purok text,
ADD COLUMN IF NOT EXISTS barangay text NOT NULL DEFAULT '';

-- Update existing rows to have empty barangay if null
UPDATE public.user_addresses 
SET barangay = '' 
WHERE barangay IS NULL;
