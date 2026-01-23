-- Fix RPC function permissions for anonymous users

-- Recreate function with SECURITY DEFINER (runs with owner's privileges)
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TEXT
SECURITY DEFINER  -- This allows the function to run with elevated privileges
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  LOOP
    result := '';

    -- Generate 6-character code
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM game_sessions WHERE session_code = result) THEN
      RETURN result;
    END IF;

    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique session code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION generate_session_code() TO anon;
GRANT EXECUTE ON FUNCTION generate_session_code() TO authenticated;
