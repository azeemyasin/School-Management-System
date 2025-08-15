// app/admin/classes/page.tsx

import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen } from "lucide-react";
import ClassCardActions from "@/components/admin/class-card-actions";
import Link from "next/link";

export default async function ClassesPage() {
  await requireRole(["admin"]);

  const { data: classes, error } = await supabaseAdmin
    .from("classes")
    .select(`
      *,
      class_teacher:class_teacher_id ( id, users ( full_name ) ),
      students(count),
      teacher_subjects(
        teachers(users(full_name)),
        subjects(name)
      )
    `)
    .order("grade_level");

  if (error) console.error("Classes fetch error:", error.message);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">Manage class structure and organization</p>
        </div>
        {/* “Add Class” button is inside the ClassCardActions for consistency? Keep your existing AddClassModal button if you prefer */}
        <ClassCardActions mode="add" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes?.map((c: any) => (
          <Card key={c.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{c.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Grade {c.grade_level}</p>
                </div>
                <Badge variant="outline">Section {c.section ?? "—"}</Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Students</span>
                  </div>
                  <span className="font-semibold">
                    {c.students?.[0]?.count || 0}
                    {typeof c.capacity === "number" ? `/${c.capacity}` : ""}
                  </span>
                </div>

                {/* Subjects & Teachers block — SINGLE place where Class Teacher is printed */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Subjects &amp; Teachers</span>
                  </div>

                  {/* Class teacher line */}
                  <div className="text-xs bg-gray-50 p-2 rounded">
                    <span className="font-medium">Class Teacher:</span>{" "}
                    <span className="text-muted-foreground">
                      {c.class_teacher?.users?.full_name ?? "Not assigned"}
                    </span>
                  </div>

                  {/* Per-subject teacher list */}
                  <div className="space-y-1">
                    {c.teacher_subjects?.length ? (
                      c.teacher_subjects.map((a: any, i: number) => (
                        <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                          <span className="font-medium">{a.subjects?.name}</span>
                          <br />
                          <span className="text-muted-foreground">
                            {a.teachers?.users?.full_name || "No teacher assigned"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No subjects assigned</p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <ClassCardActions
                  mode="row"
                  classId={c.id}
                  initial={{
                    name: c.name,
                    gradeLevel: c.grade_level,
                    section: c.section ?? "",
                    classTeacherId: c.class_teacher?.id ?? "",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!classes?.length && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-12 text-center">
          <div className="text-muted-foreground mb-4">No classes found</div>
          <ClassCardActions mode="add" />
        </div>
      )}
    </div>
  );
}
