-- Insert sample data

-- Insert classes
INSERT INTO public.classes (name, grade_level, section, capacity) VALUES
('Grade 1-A', 1, 'A', 25),
('Grade 1-B', 1, 'B', 25),
('Grade 2-A', 2, 'A', 30),
('Grade 3-A', 3, 'A', 30),
('Grade 4-A', 4, 'A', 35),
('Grade 5-A', 5, 'A', 35);

-- Insert subjects
INSERT INTO public.subjects (name, code, description) VALUES
('Mathematics', 'MATH', 'Basic mathematics and arithmetic'),
('English', 'ENG', 'English language and literature'),
('Science', 'SCI', 'General science and nature studies'),
('Social Studies', 'SS', 'History, geography, and social awareness'),
('Art', 'ART', 'Creative arts and crafts'),
('Physical Education', 'PE', 'Sports and physical activities');

-- Insert sample announcements
INSERT INTO public.announcements (title, content, target_roles, is_urgent) VALUES
('Welcome to New Academic Year', 'We welcome all students and parents to the new academic year 2024-25. Classes will begin from Monday.', ARRAY['student', 'parent'], false),
('Parent-Teacher Meeting', 'Monthly parent-teacher meeting scheduled for next Saturday at 10 AM.', ARRAY['parent', 'teacher'], true),
('Sports Day Announcement', 'Annual sports day will be held on 15th December. All students are encouraged to participate.', ARRAY['student', 'parent', 'teacher'], false);
