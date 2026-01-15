-- Add location field to profiles table for 30km warning feature
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS address text;

-- Add migration tracking to prevent duplicate profile creation
-- This tracks if user has already migrated from owner->worker or vice versa
ALTER TABLE public.worker_auth
ADD COLUMN IF NOT EXISTS migrated_from_owner boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS migrated_at timestamp with time zone;

-- Create index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_worker_auth_user_id ON public.worker_auth(user_id);

-- Allow workers to view their own data via worker_auth link
CREATE POLICY "Workers can view own worker data via worker_auth"
ON public.workers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM worker_auth wa 
    WHERE wa.worker_id = workers.id 
    AND wa.user_id = auth.uid()
  )
);

-- Workers can update their own worker profile
CREATE POLICY "Workers can update own worker data via worker_auth"
ON public.workers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM worker_auth wa 
    WHERE wa.worker_id = workers.id 
    AND wa.user_id = auth.uid()
  )
);