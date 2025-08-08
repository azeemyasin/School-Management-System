import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddTeacherGradeModal } from "@/components/teacher/add-teacher-grade-modal"

export default async function TeacherGradesPage() {
  const user = await requireRole(["teacher"])
  const supabase = await createClient()

  // Get teacher's data
  const { data: teacher } = await supabase.from("teachers").select("*").eq("user_id", user.id).single()

  // Get grades for teacher's subjects
  const { data: grades } = await supabase
    .from("grades")
    .select(`
      *,
      students(users(full_name), student_id, classes(name)),
      subjects(name, code)
    `)
    .eq("teacher_id", teacher?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grade Management</h1>
          <p className="text-muted-foreground">Manage grades for your students</p>
        </div>
        <AddTeacherGradeModal teacherId={teacher?.id} />
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Search by student name..." />
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

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Student</th>
                  <th className="text-left p-2">Subject</th>
                  <th className="text-left p-2">Exam Type</th>
                  <th className="text-left p-2">Marks</th>
                  <th className="text-left p-2">Percentage</th>
                  <th className="text-left p-2">Grade</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grades?.map((grade) => {
                  const percentage = Math.round((grade.marks_obtained / grade.total_marks) * 100)
                  const letterGrade =
                    percentage >= 90
                      ? "A+"
                      : percentage >= 80
                        ? "A"
                        : percentage >= 70
                          ? "B"
                          : percentage >= 60
                            ? "C"
                            : "F"
                  return (
                    <tr key={grade.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{grade.students?.users?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {grade.students?.student_id} - {grade.students?.classes?.name}
                          </p>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{grade.subjects?.name}</Badge>
                      </td>
                      <td className="p-2">{grade.exam_type}</td>
                      <td className="p-2">
                        {grade.marks_obtained}/{grade.total_marks}
                      </td>
                      <td className="p-2">{percentage}%</td>
                      <td className="p-2">
                        <Badge
                          variant={
                            letterGrade === "A+" || letterGrade === "A"
                              ? "default"
                              : letterGrade === "B"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {letterGrade}
                        </Badge>
                      </td>
                      <td className="p-2">{grade.exam_date ? new Date(grade.exam_date).toLocaleDateString() : "-"}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!grades?.length && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No grades found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
