-- RLS Policies

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students table policies
CREATE POLICY "Students can view their own data" ON public.students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Parents can view their children's data" ON public.students
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Teachers can view students in their classes" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_subjects ts
      JOIN public.teachers t ON t.id = ts.teacher_id
      WHERE t.user_id = auth.uid() AND ts.class_id = students.class_id
    )
  );

CREATE POLICY "Admin and receptionist can manage students" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'receptionist')
    )
  );

-- Teachers table policies
CREATE POLICY "Teachers can view their own data" ON public.teachers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can manage teachers" ON public.teachers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Attendance policies
CREATE POLICY "Students and parents can view attendance" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = attendance.student_id 
      AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage attendance for their classes" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teacher_subjects ts
      JOIN public.teachers t ON t.id = ts.teacher_id
      WHERE t.user_id = auth.uid() AND ts.class_id = attendance.class_id
    )
  );

CREATE POLICY "Admin and receptionist can manage all attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'receptionist')
    )
  );

-- Grades policies
CREATE POLICY "Students and parents can view grades" ON public.grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = grades.student_id 
      AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage grades for their subjects" ON public.grades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = grades.teacher_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all grades" ON public.grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fee records policies
CREATE POLICY "Students and parents can view fee records" ON public.fee_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = fee_records.student_id 
      AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())
    )
  );

CREATE POLICY "Admin and receptionist can manage fee records" ON public.fee_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'receptionist')
    )
  );

-- Announcements policies
CREATE POLICY "Users can view announcements for their role" ON public.announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = ANY(announcements.target_roles)
    )
  );

CREATE POLICY "Admin can manage announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Timetable policies
CREATE POLICY "Everyone can view timetable" ON public.timetable
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage timetable" ON public.timetable
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Classes and subjects - everyone can view, admin can manage
CREATE POLICY "Everyone can view classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Admin can manage classes" ON public.classes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admin can manage subjects" ON public.subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view teacher_subjects" ON public.teacher_subjects FOR SELECT USING (true);
CREATE POLICY "Admin can manage teacher_subjects" ON public.teacher_subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
