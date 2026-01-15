-- Fix security: Restrict workers table SELECT to only allow workers to see their own data
-- and owners to see workers they have hired or are assigned to them

-- First drop the overly permissive policies
DROP POLICY IF EXISTS "Verified workers are viewable by authenticated users" ON workers;
DROP POLICY IF EXISTS "Workers can view own data" ON workers;

-- Create more restrictive policies for workers table
-- Workers can only see their own data via worker_auth
-- (Policy "Workers can view own worker data via worker_auth" already exists and is secure)

-- Owners can only see workers they've hired
CREATE POLICY "Owners can view their hired workers"
ON workers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hired_workers hw
    WHERE hw.worker_id = workers.id AND hw.owner_id = auth.uid()
  )
);

-- Owners can see workers assigned to their bookings
CREATE POLICY "Owners can view workers assigned to their bookings"
ON workers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.assigned_worker_id = workers.id AND b.user_id = auth.uid()
  )
);

-- Fix bookings table: Workers should be able to see bookings assigned to them
-- but only limited data (not sensitive contact info)
CREATE POLICY "Workers can view their assigned bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM worker_auth wa
    JOIN workers w ON wa.worker_id = w.id
    WHERE wa.user_id = auth.uid() AND bookings.assigned_worker_id = w.id
  )
);