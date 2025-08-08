-- Create an admin user after running the main scripts
-- First, you'll need to sign up through the Supabase Auth UI or your app
-- Then run this script to set the user as admin

-- Replace 'your-admin-email@example.com' with the actual email you used to sign up
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-admin-email@example.com';

-- Insert the user profile (replace the email with your actual admin email)
INSERT INTO public.users (id, email, full_name, role, phone, address)
SELECT 
  id,
  email,
  'System Administrator',
  'admin'::user_role,
  '+1234567890',
  'School Address'
FROM auth.users 
WHERE email = 'your-admin-email@example.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin'::user_role,
  full_name = 'System Administrator';
