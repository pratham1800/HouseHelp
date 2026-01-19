-- Update the handle_new_user function to set correct user_role based on signup_portal
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  signup_portal text;
BEGIN
  -- Get the signup portal from user metadata
  signup_portal := NEW.raw_user_meta_data->>'signup_portal';
  
  -- Default to 'owner' if not specified
  IF signup_portal IS NULL OR signup_portal = '' THEN
    signup_portal := 'owner';
  END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url, user_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    signup_portal
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;