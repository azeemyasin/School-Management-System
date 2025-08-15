import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/utils/supabase/admin"; // ▼ use admin client
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddStudentModal } from "@/components/admin/add-student-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StudentRowActions from "@/components/admin/student-row-actions";
import PasswordCell from "@/components/admin/password-cell";

export default async function StudentsPage() {
  await requireRole(["admin"]);

  // Use the service-role client on the server page to bypass RLS for admins
  const { data: students, error } = await supabaseAdmin
    .from("students")
    .select(
      `
      user_id,
      student_id,
      created_at,
      date_of_birth,
      emergency_contact,
      medical_info,
      raw_password,
      users:user_id ( full_name, email ),
      classes ( name, grade_level ),
      parents:parent_id ( full_name, email )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    // Optional: log or surface a small inline error
    console.error("Failed to load students:", error.message);
  }

  const rows = (students ?? []).map((s: any) => ({
    userId: s.user_id,
    studentId: s.student_id,
    fullName: s.users?.full_name ?? "",
    email: s.users?.email ?? "",
    className: s.classes?.name ?? null,
    grade: s.classes?.grade_level ?? null,
    parentName: s.parents?.full_name ?? null,
    admittedAt: s.created_at,
    dob: s.date_of_birth,
    rawPassword: s.raw_password ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage student records and information
          </p>
        </div>
        <AddStudentModal />
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Search by name, student ID, or email..." />
            </div>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table view */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Admitted</TableHead>
                <TableHead>Password</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.userId}>
                  <TableCell className="font-medium">{r.fullName}</TableCell>
                  <TableCell>{r.studentId}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>
                    {r.className ? (
                      <Badge variant="secondary">
                        {r.className} {r.grade ? `(Grade ${r.grade})` : ""}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {r.admittedAt
                      ? new Date(r.admittedAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <PasswordCell value={r.rawPassword} />
                  </TableCell>
                  <TableCell className="text-right">
                    <StudentRowActions userId={r.userId} />
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
