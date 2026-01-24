-- Add policy for workers to view their own hired records
CREATE POLICY "Workers can view their hired records" 
ON public.hired_workers 
FOR SELECT 
USING (worker_id = current_worker_id());

-- Add policy for workers to view attendance records for their hired records
CREATE POLICY "Workers can view their own attendance" 
ON public.worker_attendance 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM hired_workers hw
    WHERE hw.id = worker_attendance.hired_worker_id
    AND hw.worker_id = current_worker_id()
  )
);