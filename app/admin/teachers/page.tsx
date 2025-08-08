// app/admin/teachers/page.tsx
import { requireRole } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { AddTeacherModal } from "@/components/admin/add-teacher-modal";
import TeachersTable, { type TeacherRow } from "@/components/admin/teachers-table";

export default async function TeachersPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from("teachers")
    .select(`
      user_id,
      employee_id,
      qualification,
      experience_years,
      salary,
      raw_password,
      users:user_id ( full_name, email, phone ),
      teacher_subjects ( subjects (name), classes (name, grade_level) )
    `)
    .order("created_at", { ascending: false });

  const rows: TeacherRow[] = (teachers ?? []).map((t: any) => ({
    userId: t.user_id,
    name: t.users?.full_name ?? "",
    email: t.users?.email ?? "",
    phone: t.users?.phone ?? "",
    employeeId: t.employee_id ?? "",
    subjects: (t.teacher_subjects ?? []).map((a: any) =>
      [a?.subjects?.name, a?.classes?.name].filter(Boolean).join(" - ")
    ),
    password: t.raw_password ?? "",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">Manage teaching staff and their assignments</p>
        </div>
        <AddTeacherModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Search by name, employee ID, or email..." />
            </div>
            <Button variant="outline"><Search className="mr-2 h-4 w-4" />Search</Button>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filter</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <TeachersTable rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
