-- Create custom types first
CREATE TYPE user_role AS ENUM ('admin', 'receptionist', 'teacher', 'student', 'parent');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE fee_status AS ENUM ('paid', 'pending', 'overdue');
