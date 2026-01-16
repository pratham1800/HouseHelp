-- Create workers table for domestic help workers
CREATE TABLE public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT NOT NULL,
  has_whatsapp BOOLEAN DEFAULT true,
  work_type TEXT NOT NULL, -- 'domestic_help', 'cooking', 'driving', 'gardening'
  years_experience INTEGER DEFAULT 0,
  languages_spoken TEXT[] DEFAULT '{}',
  preferred_areas TEXT[] DEFAULT '{}',
  working_hours TEXT DEFAULT 'full_day', -- 'morning', 'evening', 'full_day'
  id_proof_url TEXT,
  residential_address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending_verification', -- 'pending_verification', 'verified', 'rejected', 'assigned'
  verification_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  match_score INTEGER DEFAULT 0,
  assigned_customer_id UUID,
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  scheduled_call_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Create policies for workers table
-- Allow public read of verified workers (for matching)
CREATE POLICY "Verified workers are viewable by authenticated users"
ON public.workers
FOR SELECT
USING (status = 'verified' OR auth.uid() IS NOT NULL);

-- Allow workers to view their own data
CREATE POLICY "Workers can view own data"
ON public.workers
FOR SELECT
USING (phone IS NOT NULL);

CREATE POLICY "Workers can update their own profile" 
ON public.workers 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Workers can insert their own profile" 
ON public.workers 
FOR INSERT 
WITH CHECK (auth.uid() = id);



// -- Allow authenticated users to insert workers (internal team)
// CREATE POLICY "Authenticated users can create workers"
// ON public.workers
// FOR INSERT
// WITH CHECK (auth.uid() IS NOT NULL);

// -- Allow authenticated users to update workers (internal team/admin)
// CREATE POLICY "Authenticated users can update workers"
// ON public.workers
// FOR UPDATE
// USING (auth.uid() IS NOT NULL);

-- Create worker_auth table to link workers with auth
CREATE TABLE public.worker_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(worker_id),
  UNIQUE(user_id)
);

-- Enable RLS for worker_auth
ALTER TABLE public.worker_auth ENABLE ROW LEVEL SECURITY;

-- Workers can view their own auth record
CREATE POLICY "Users can view own worker auth"
ON public.worker_auth
FOR SELECT
USING (auth.uid() = user_id);

-- Create storage bucket for ID proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('worker-documents', 'worker-documents', false);

-- Storage policies for worker documents
CREATE POLICY "Authenticated users can upload worker documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'worker-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view worker documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'worker-documents' AND auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_workers_updated_at
BEFORE UPDATE ON public.workers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();