import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddStudentModal } from "@/components/admin/add-student-modal"

export default async function StudentsPage() {
  const user = await requireRole(["admin"])
  const supabase = await createClient()

  const { data: students } = await supabase
    .from("students")
    .select(`
      *,
      users:user_id(full_name, email),
      classes(name, grade_level),
      parents:parent_id(full_name, email)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">Manage student records and information</p>
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
                  <p className="text-sm text-muted-foreground mt-1">
                    Parent: {student.parents?.full_name || "Not assigned"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Admitted: {new Date(student.admission_date).toLocaleDateString()}
                  </p>
                  {student.date_of_birth && (
                    <p className="text-sm text-muted-foreground">
                      DOB: {new Date(student.date_of_birth).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first student to the system.</p>
            <AddStudentModal />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
