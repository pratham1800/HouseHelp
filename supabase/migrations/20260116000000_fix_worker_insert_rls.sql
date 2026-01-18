-- Create function to handle worker profile creation with SECURITY DEFINER
-- This bypasses RLS to allow users to create their own worker profile
CREATE OR REPLACE FUNCTION public.create_worker_profile(
  p_user_id UUID,
  p_name TEXT,
  p_phone TEXT DEFAULT '',
  p_work_type TEXT DEFAULT 'domestic_help',
  p_years_experience INTEGER DEFAULT 0,
  p_languages_spoken TEXT[] DEFAULT '{}',
  p_preferred_areas TEXT[] DEFAULT '{}',
  p_working_hours TEXT DEFAULT 'full_day',
  p_residential_address TEXT DEFAULT '',
  p_status TEXT DEFAULT 'pending_verification',
  p_match_score INTEGER DEFAULT 0,
  p_age INTEGER DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_has_whatsapp BOOLEAN DEFAULT true,
  p_id_proof_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_worker_id UUID;
BEGIN
  -- Verify that the user is creating their own profile
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Users can only create their own worker profile';
  END IF;

  -- Insert worker profile
  INSERT INTO public.workers (
    id,
    name,
    phone,
    work_type,
    years_experience,
    languages_spoken,
    preferred_areas,
    working_hours,
    residential_address,
    status,
    match_score,
    age,
    gender,
    has_whatsapp,
    id_proof_url,
    notes
  )
  VALUES (
    p_user_id,
    p_name,
    p_phone,
    p_work_type,
    p_years_experience,
    p_languages_spoken,
    p_preferred_areas,
    p_working_hours,
    p_residential_address,
    p_status,
    p_match_score,
    p_age,
    p_gender,
    p_has_whatsapp,
    p_id_proof_url,
    p_notes
  )
  RETURNING id INTO v_worker_id;
  
  RETURN v_worker_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_worker_profile TO authenticated;
