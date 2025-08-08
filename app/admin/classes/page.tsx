import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, BookOpen, Edit, Trash2 } from "lucide-react"
import { AddClassModal } from "@/components/admin/add-class-modal"

export default async function ClassesPage() {
  const user = await requireRole(["admin"])
  const supabase = await createClient()

  const { data: classes } = await supabase
    .from("classes")
    .select(`
      *,
      students(count),
      teacher_subjects(
        teachers(users(full_name)),
        subjects(name)
      )
    `)
    .order("grade_level")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">Manage class structure and organization</p>
        </div>
        <AddClassModal />
      </div>

      {/* Classes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes?.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{classItem.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Grade {classItem.grade_level}</p>
                </div>
                <Badge variant="outline">Section {classItem.section}</Badge>
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
                    {classItem.students?.[0]?.count || 0}/{classItem.capacity}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Subjects & Teachers</span>
                  </div>
                  <div className="space-y-1">
                    {classItem.teacher_subjects?.map((assignment: any, index: number) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                        <span className="font-medium">{assignment.subjects?.name}</span>
                        <br />
                        <span className="text-muted-foreground">
                          {assignment.teachers?.users?.full_name || "No teacher assigned"}
                        </span>
                      </div>
                    ))}
                    {!classItem.teacher_subjects?.length && (
                      <p className="text-xs text-muted-foreground">No subjects assigned</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Details
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

      {!classes?.length && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No classes found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first class.</p>
            <AddClassModal />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
