-- Verify that users exist and check their data
SELECT 
  u.email,
  u.full_name,
  u.role,
  au.email_confirmed_at,
  au.created_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at;

-- If no users exist, let's check auth.users table
SELECT email, email_confirmed_at, created_at FROM auth.users ORDER BY created_at;
