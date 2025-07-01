
-- Add foreign key constraint for purchases table to link to profiles (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'purchases_user_id_fkey' 
        AND table_name = 'purchases'
    ) THEN
        ALTER TABLE public.purchases
        ADD CONSTRAINT purchases_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;
