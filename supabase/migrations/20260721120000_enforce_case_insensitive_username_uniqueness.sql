ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username_canonical TEXT GENERATED ALWAYS AS (lower(username)) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_canonical_unique_idx
ON profiles (username_canonical);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, username, full_name, mobile)
  VALUES (
    NEW.id,
    lower(NEW.raw_user_meta_data->>'username'),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'mobile'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;