import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddTeacherModal } from "@/components/admin/add-teacher-modal"

export default async function TeachersPage() {
  const user = await requireRole(["admin"])
  const supabase = await createClient()

  const { data: teachers } = await supabase
    .from("teachers")
    .select(`
      *,
      users:user_id(full_name, email, phone),
      teacher_subjects(
        subjects(name, code),
        classes(name, grade_level)
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">Manage teaching staff and their assignments</p>
        </div>
        <AddTeacherModal />
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Search by name, employee ID, or email..." />
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

      {/* Teachers List */}
      <div className="grid gap-4">
        {teachers?.map((teacher) => (
          <Card key={teacher.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">{teacher.users?.full_name?.charAt(0) || "T"}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{teacher.users?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">Employee ID: {teacher.employee_id}</p>
                    <p className="text-sm text-muted-foreground">Email: {teacher.users?.email}</p>
                    <p className="text-sm text-muted-foreground">Phone: {teacher.users?.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {teacher.teacher_subjects?.map((assignment: any, index: number) => (
                      <Badge key={index} variant="secondary">
                        {assignment.subjects?.name} - {assignment.classes?.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Qualification: {teacher.qualification}</p>
                  <p className="text-sm text-muted-foreground">Experience: {teacher.experience_years} years</p>
                  <p className="text-sm text-muted-foreground">Salary: ${teacher.salary?.toLocaleString()}</p>
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

      {!teachers?.length && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No teachers found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first teacher to the system.</p>
            <AddTeacherModal />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
