import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Calendar, Award } from "lucide-react"

export default async function TeacherClassesPage() {
  const user = await requireRole(["teacher"])
  const supabase = await createClient()

  // Get teacher's data
  const { data: teacher } = await supabase.from("teachers").select("*").eq("user_id", user.id).single()

  // Get teacher's assigned classes and subjects
  const { data: assignments } = await supabase
    .from("teacher_subjects")
    .select(`
      *,
      classes(*, students(count)),
      subjects(name, code, description)
    `)
    .eq("teacher_id", teacher?.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Classes</h1>
        <p className="text-muted-foreground">Manage your assigned classes and subjects</p>
      </div>

      {/* Classes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments?.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{assignment.subjects?.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{assignment.classes?.name}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{assignment.subjects?.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Students</span>
                  </div>
                  <span className="font-semibold">{assignment.classes?.students?.[0]?.count || 0}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Calendar className="h-4 w-4 mr-1" />
                    Attendance
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Award className="h-4 w-4 mr-1" />
                    Grades
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!assignments?.length && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No classes assigned</h3>
            <p className="text-muted-foreground">Contact the administrator to get class assignments.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
