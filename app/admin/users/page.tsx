import { requireRole } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import UserRowActions from "@/components/admin/user-row-actions";

export default async function UsersPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select(
      `
id,
email,
full_name,
role,
created_at,
students:students!students_user_id_fkey(student_id),
teachers:teachers!teachers_user_id_fkey(id),
receptionists:receptionists!receptionists_user_id_fkey(id)
`
    )
    .neq("role", "admin") // Exclude admin users
    .order("created_at", { ascending: false });

  if (error) {
    console.log("users select error:", error);
  }

  const rows = (data ?? []).map((u: any) => ({
    userId: u.id,
    name: u.full_name,
    email: u.email,
    role: u.role,
    createdAt: u.created_at,
    studentId: u.students?.student_id ?? null,
    teacherId: u.teachers?.id ?? null, // <- use id from teachers
    receptionistId: u.receptionists?.id ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">All user accounts and roles</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Search by name or email..." />
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

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Ref</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.userId}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {r.role === "student" && r.studentId
                      ? `SID: ${r.studentId}`
                      : r.role === "teacher" && r.teacherId
                      ? `TID: ${r.teacherId}`
                      : r.role === "receptionist" && r.receptionistId
                      ? `RID: ${r.receptionistId}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserRowActions userId={r.userId} role={r.role} />
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No users found.
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
