-- Fix the bookings SELECT policy to only allow users to view their own bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add user_role column to profiles to track owner vs worker preference
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_role text DEFAULT 'owner';

-- Update worker_auth to allow users to insert their own auth record
// DROP POLICY IF EXISTS "Users can insert own worker auth" ON public.worker_auth;
// CREATE POLICY "Users can insert own worker auth" 
// ON public.worker_auth 
// FOR INSERT 
// WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own worker auth
DROP POLICY IF EXISTS "Users can update own worker auth" ON public.worker_auth;
CREATE POLICY "Users can update own worker auth" 
ON public.worker_auth 
FOR UPDATE 
USING (auth.uid() = user_id);