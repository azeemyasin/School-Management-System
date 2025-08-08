-- Create sample users for testing (run this after creating the admin user)

-- Sample Teacher
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'teacher@school.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Sample Student  
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'student@school.com', 
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Sample Parent
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'parent@school.com',
  crypt('password123', gen_salt('bf')), 
  now(),
  now(),
  now()
);

-- Insert corresponding user profiles
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, 
  CASE 
    WHEN email = 'teacher@school.com' THEN 'John Teacher'
    WHEN email = 'student@school.com' THEN 'Jane Student'  
    WHEN email = 'parent@school.com' THEN 'Bob Parent'
  END,
  CASE
    WHEN email = 'teacher@school.com' THEN 'teacher'::user_role
    WHEN email = 'student@school.com' THEN 'student'::user_role
    WHEN email = 'parent@school.com' THEN 'parent'::user_role
  END
FROM auth.users 
WHERE email IN ('teacher@school.com', 'student@school.com', 'parent@school.com');
