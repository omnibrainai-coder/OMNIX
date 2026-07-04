-- Users table में Verified और Private अकाउंट के फीचर्स जोड़ना
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- कमेंट्स ताकि याद रहे कि ये कॉलम्स क्यों हैं
COMMENT ON COLUMN public.users.is_verified IS 'True if the user has a blue tick / verified badge';
COMMENT ON COLUMN public.users.is_private IS 'True if the user profile is locked/private';
