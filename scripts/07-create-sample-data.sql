-- Create comprehensive sample data for testing

-- Insert sample teachers first
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'teacher1@school.com',
  crypt('teacher123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "teacher"}',
  NOW(), NOW()
),
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'teacher2@school.com',
  crypt('teacher123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "teacher"}',
  NOW(), NOW()
);

-- Insert teacher profiles
INSERT INTO public.users (id, email, full_name, role, phone)
SELECT id, email,
  CASE 
    WHEN email = 'teacher1@school.com' THEN 'Sarah Johnson'
    WHEN email = 'teacher2@school.com' THEN 'Michael Brown'
  END,
  'teacher'::user_role,
  CASE 
    WHEN email = 'teacher1@school.com' THEN '+1-555-0124'
    WHEN email = 'teacher2@school.com' THEN '+1-555-0125'
  END
FROM auth.users 
WHERE email IN ('teacher1@school.com', 'teacher2@school.com');

-- Insert sample parent
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'parent@school.com',
  crypt('parent123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "parent"}',
  NOW(), NOW()
);

-- Insert parent profile
INSERT INTO public.users (id, email, full_name, role, phone)
SELECT id, 'parent@school.com', 'Robert Wilson', 'parent'::user_role, '+1-555-0126'
FROM auth.users WHERE email = 'parent@school.com';

-- Insert sample student
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'student@school.com',
  crypt('student123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "student"}',
  NOW(), NOW()
);

-- Insert student profile
INSERT INTO public.users (id, email, full_name, role, phone)
SELECT id, 'student@school.com', 'Emma Wilson', 'student'::user_role, '+1-555-0127'
FROM auth.users WHERE email = 'student@school.com';

-- Insert receptionist
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'receptionist@school.com',
  crypt('reception123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "receptionist"}',
  NOW(), NOW()
);

-- Insert receptionist profile
INSERT INTO public.users (id, email, full_name, role, phone)
SELECT id, 'receptionist@school.com', 'Lisa Martinez', 'receptionist'::user_role, '+1-555-0128'
FROM auth.users WHERE email = 'receptionist@school.com';

-- Create teacher records
INSERT INTO public.teachers (user_id, employee_id, qualification, experience_years, salary)
SELECT u.id, 
  CASE 
    WHEN u.email = 'teacher1@school.com' THEN 'T001'
    WHEN u.email = 'teacher2@school.com' THEN 'T002'
  END,
  CASE 
    WHEN u.email = 'teacher1@school.com' THEN 'M.Ed Mathematics'
    WHEN u.email = 'teacher2@school.com' THEN 'B.Sc Physics, B.Ed'
  END,
  CASE 
    WHEN u.email = 'teacher1@school.com' THEN 8
    WHEN u.email = 'teacher2@school.com' THEN 5
  END,
  CASE 
    WHEN u.email = 'teacher1@school.com' THEN 55000.00
    WHEN u.email = 'teacher2@school.com' THEN 48000.00
  END
FROM public.users u 
WHERE u.role = 'teacher';

-- Create student record
INSERT INTO public.students (user_id, student_id, class_id, parent_id, date_of_birth, emergency_contact)
SELECT 
  s.id,
  'STU001',
  c.id,
  p.id,
  '2010-05-15',
  'Emergency: +1-555-9999'
FROM public.users s
CROSS JOIN public.users p
CROSS JOIN public.classes c
WHERE s.email = 'student@school.com' 
  AND p.email = 'parent@school.com'
  AND c.name = 'Grade 5-A';

-- Create teacher-subject assignments
INSERT INTO public.teacher_subjects (teacher_id, subject_id, class_id)
SELECT t.id, s.id, c.id
FROM public.teachers t
JOIN public.users u ON t.user_id = u.id
CROSS JOIN public.subjects s
CROSS JOIN public.classes c
WHERE u.email = 'teacher1@school.com' 
  AND s.code = 'MATH'
  AND c.grade_level = 5;

INSERT INTO public.teacher_subjects (teacher_id, subject_id, class_id)
SELECT t.id, s.id, c.id
FROM public.teachers t
JOIN public.users u ON t.user_id = u.id
CROSS JOIN public.subjects s
CROSS JOIN public.classes c
WHERE u.email = 'teacher2@school.com' 
  AND s.code = 'SCI'
  AND c.grade_level = 5;

-- Add sample grades
INSERT INTO public.grades (student_id, subject_id, teacher_id, exam_type, marks_obtained, total_marks, exam_date)
SELECT 
  st.id,
  sub.id,
  t.id,
  'Mid-term Exam',
  85.5,
  100.0,
  '2024-11-15'
FROM public.students st
JOIN public.subjects sub ON sub.code = 'MATH'
JOIN public.teachers t ON t.employee_id = 'T001'
WHERE st.student_id = 'STU001';

INSERT INTO public.grades (student_id, subject_id, teacher_id, exam_type, marks_obtained, total_marks, exam_date)
SELECT 
  st.id,
  sub.id,
  t.id,
  'Mid-term Exam',
  78.0,
  100.0,
  '2024-11-16'
FROM public.students st
JOIN public.subjects sub ON sub.code = 'SCI'
JOIN public.teachers t ON t.employee_id = 'T002'
WHERE st.student_id = 'STU001';

-- Add sample attendance
INSERT INTO public.attendance (student_id, class_id, date, status, marked_by)
SELECT 
  st.id,
  st.class_id,
  CURRENT_DATE - INTERVAL '1 day',
  'present'::attendance_status,
  u.id
FROM public.students st
JOIN public.users u ON u.role = 'teacher'
WHERE st.student_id = 'STU001'
LIMIT 1;

-- Add sample fee records
INSERT INTO public.fee_records (student_id, amount, due_date, status, fee_type, academic_year)
SELECT 
  st.id,
  500.00,
  '2024-12-31',
  'pending'::fee_status,
  'Tuition Fee',
  '2024-25'
FROM public.students st
WHERE st.student_id = 'STU001';

INSERT INTO public.fee_records (student_id, amount, due_date, paid_date, status, fee_type, academic_year)
SELECT 
  st.id,
  150.00,
  '2024-11-30',
  '2024-11-25',
  'paid'::fee_status,
  'Activity Fee',
  '2024-25'
FROM public.students st
WHERE st.student_id = 'STU001';
