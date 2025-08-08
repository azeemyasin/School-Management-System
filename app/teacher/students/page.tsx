import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Filter, Mail, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"

export default async function TeacherStudentsPage() {
  const user = await requireRole(["teacher"])
  const supabase = await createClient()

  // Get teacher's data
  const { data: teacher } = await supabase.from("teachers").select("*").eq("user_id", user.id).single()

  // Get students in teacher's classes
  const { data: students } = await supabase
    .from("students")
    .select(`
      *,
      users:user_id(full_name, email),
      classes(name, grade_level),
      parents:parent_id(full_name, email, phone)
    `)
    .in(
      "class_id",
      await supabase
        .from("teacher_subjects")
        .select("class_id")
        .eq("teacher_id", teacher?.id)
        .then((res) => res.data?.map((item) => item.class_id) || []),
    )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Students</h1>
        <p className="text-muted-foreground">Students in your assigned classes</p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Search by name or student ID..." />
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

      {/* Students List */}
      <div className="grid gap-4">
        {students?.map((student) => (
          <Card key={student.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{student.users?.full_name?.charAt(0) || "S"}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{student.users?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">Student ID: {student.student_id}</p>
                    <p className="text-sm text-muted-foreground">Email: {student.users?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">
                    {student.classes?.name} (Grade {student.classes?.grade_level})
                  </Badge>
                  {student.parents && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Parent: {student.parents.full_name}</p>
                      <p className="text-sm text-muted-foreground">Email: {student.parents.email}</p>
                      {student.parents.phone && (
                        <p className="text-sm text-muted-foreground">Phone: {student.parents.phone}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  {student.parents?.phone && (
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!students?.length && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground">You don't have any students assigned to your classes yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
