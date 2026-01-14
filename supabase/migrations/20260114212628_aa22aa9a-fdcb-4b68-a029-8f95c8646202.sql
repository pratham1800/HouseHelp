-- Create hired_workers table for employee management
CREATE TABLE public.hired_workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  hired_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  agreed_salary INTEGER NOT NULL,
  salary_frequency TEXT NOT NULL DEFAULT 'monthly', -- daily, weekly, monthly
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, terminated
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_id, worker_id)
);

-- Create attendance table
CREATE TABLE public.worker_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hired_worker_id UUID NOT NULL REFERENCES public.hired_workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIME,
  clock_out TIME,
  status TEXT NOT NULL DEFAULT 'present', -- present, absent, late, half_day, leave
  leave_type TEXT, -- sick, personal, vacation, emergency
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker_ratings table
CREATE TABLE public.worker_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker_awards table
CREATE TABLE public.worker_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  award_type TEXT NOT NULL, -- worker_of_month, best_rating, milestone
  title TEXT NOT NULL,
  description TEXT,
  bonus_amount INTEGER DEFAULT 0,
  month DATE,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create booking_payments table for tracking 2rs per booking fees
CREATE TABLE public.booking_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 200, -- 2 rupees in paisa
  payment_type TEXT NOT NULL DEFAULT 'booking_fee',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, waived
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add column to bookings for assigned worker tracking
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS assigned_worker_id UUID REFERENCES public.workers(id),
ADD COLUMN IF NOT EXISTS call_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS call_status TEXT DEFAULT 'pending'; -- pending, scheduled, completed, cancelled

-- Create call_limits table for non-subscribed users
CREATE TABLE public.user_call_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  calls_used INTEGER NOT NULL DEFAULT 0,
  max_calls INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hired_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_call_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hired_workers
CREATE POLICY "Owners can view their hired workers" ON public.hired_workers
FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can hire workers" ON public.hired_workers
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their hired workers" ON public.hired_workers
FOR UPDATE USING (auth.uid() = owner_id);

-- RLS Policies for worker_attendance
CREATE POLICY "Owners can view attendance for their workers" ON public.worker_attendance
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.hired_workers hw 
    WHERE hw.id = hired_worker_id AND hw.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can manage attendance" ON public.worker_attendance
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.hired_workers hw 
    WHERE hw.id = hired_worker_id AND hw.owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can update attendance" ON public.worker_attendance
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.hired_workers hw 
    WHERE hw.id = hired_worker_id AND hw.owner_id = auth.uid()
  )
);

-- RLS Policies for worker_ratings
CREATE POLICY "Public ratings are viewable by all" ON public.worker_ratings
FOR SELECT USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Owners can create ratings" ON public.worker_ratings
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their ratings" ON public.worker_ratings
FOR UPDATE USING (auth.uid() = owner_id);

-- RLS Policies for worker_awards
CREATE POLICY "Public awards are viewable by all" ON public.worker_awards
FOR SELECT USING (is_public = true);

-- RLS Policies for booking_payments
CREATE POLICY "Users can view their payments" ON public.booking_payments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments" ON public.booking_payments
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_call_limits
CREATE POLICY "Users can view their call limits" ON public.user_call_limits
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their call limits record" ON public.user_call_limits
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their call limits" ON public.user_call_limits
FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_hired_workers_updated_at
BEFORE UPDATE ON public.hired_workers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_call_limits_updated_at
BEFORE UPDATE ON public.user_call_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();