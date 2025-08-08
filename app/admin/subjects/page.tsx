import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Edit, Trash2 } from "lucide-react"
import { AddSubjectModal } from "@/components/admin/add-subject-modal"

export default async function SubjectsPage() {
  const user = await requireRole(["admin"])
  const supabase = await createClient()

  const { data: subjects } = await supabase
    .from("subjects")
    .select(`
      *,
      teacher_subjects(
        teachers(users(full_name)),
        classes(name, grade_level)
      )
    `)
    .order("name")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-muted-foreground">Manage curriculum subjects and assignments</p>
        </div>
        <AddSubjectModal />
      </div>

      {/* Subjects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects?.map((subject) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{subject.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Code: {subject.code}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subject.description && <p className="text-sm text-muted-foreground">{subject.description}</p>}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Teaching Assignments</h4>
                  <div className="space-y-1">
                    {subject.teacher_subjects?.map((assignment: any, index: number) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{assignment.classes?.name}</span>
                          <Badge variant="outline" className="text-xs">
                            Grade {assignment.classes?.grade_level}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground">
                          {assignment.teachers?.users?.full_name || "No teacher assigned"}
                        </span>
                      </div>
                    ))}
                    {!subject.teacher_subjects?.length && (
                      <p className="text-xs text-muted-foreground">No assignments yet</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Assign
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

      {!subjects?.length && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No subjects found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first subject.</p>
            <AddSubjectModal />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
