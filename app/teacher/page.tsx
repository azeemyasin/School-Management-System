import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Calendar, Award } from "lucide-react"

export default async function TeacherDashboard() {
  const user = await requireRole(["teacher"])
  const supabase = await createClient()

  // Get teacher's data
  const { data: teacher } = await supabase.from("teachers").select("*").eq("user_id", user.id).single()

  // Get teacher's assigned classes and subjects
  const { data: assignments } = await supabase
    .from("teacher_subjects")
    .select(`
      *,
      classes(name, grade_level),
      subjects(name, code)
    `)
    .eq("teacher_id", teacher?.id)

  // Get students count in teacher's classes
  const classIds = assignments?.map((a) => a.class_id) || []
  const { count: studentsCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .in("class_id", classIds)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.full_name}. Here's your teaching overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Need to be entered</p>
          </CardContent>
        </Card>
      </div>

      {/* My Classes */}
      <Card>
        <CardHeader>
          <CardTitle>My Classes & Subjects</CardTitle>
          <CardDescription>Classes and subjects you're currently teaching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {assignments?.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{assignment.subjects?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {assignment.classes?.name} (Grade {assignment.classes?.grade_level})
                      </p>
                      <p className="text-xs text-muted-foreground">Code: {assignment.subjects?.code}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!assignments?.length && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No classes assigned</h3>
              <p className="text-muted-foreground">Contact the administrator to get class assignments.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Mark Attendance</p>
                  <p className="text-sm text-muted-foreground">Record today's attendance</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Enter Grades</p>
                  <p className="text-sm text-muted-foreground">Add or update student grades</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Mathematics</p>
                  <p className="text-sm text-muted-foreground">Grade 5-A</p>
                </div>
                <span className="text-sm font-medium">9:00 AM</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Science</p>
                  <p className="text-sm text-muted-foreground">Grade 4-A</p>
                </div>
                <span className="text-sm font-medium">11:00 AM</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">Mathematics</p>
                  <p className="text-sm text-muted-foreground">Grade 3-A</p>
                </div>
                <span className="text-sm font-medium">2:00 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
