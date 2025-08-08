import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react"
import { MarkAttendanceModal } from "@/components/teacher/mark-attendance-modal"

export default async function TeacherAttendancePage() {
  const user = await requireRole(["teacher"])
  const supabase = await createClient()

  // Get teacher's data
  const { data: teacher } = await supabase.from("teachers").select("*").eq("user_id", user.id).single()

  // Get today's attendance for teacher's classes
  const today = new Date().toISOString().split("T")[0]
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select(`
      *,
      students(users(full_name), classes(name))
    `)
    .eq("date", today)
    .eq("marked_by", user.id)

  // Get teacher's classes
  const { data: teacherClasses } = await supabase
    .from("teacher_subjects")
    .select(`
      classes(*, students(count))
    `)
    .eq("teacher_id", teacher?.id)

  const presentCount = todayAttendance?.filter((a) => a.status === "present").length || 0
  const absentCount = todayAttendance?.filter((a) => a.status === "absent").length || 0
  const lateCount = todayAttendance?.filter((a) => a.status === "late").length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Mark and track student attendance for your classes</p>
        </div>
        <MarkAttendanceModal teacherId={teacher?.id} />
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Marked</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendance?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Students today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground">Students present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <p className="text-xs text-muted-foreground">Students absent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
            <p className="text-xs text-muted-foreground">Students late</p>
          </CardContent>
        </Card>
      </div>

      {/* My Classes */}
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teacherClasses?.map((item) => (
              <Card key={item.classes?.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{item.classes?.name}</h3>
                    <Badge variant="outline">Grade {item.classes?.grade_level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {item.classes?.students?.[0]?.count || 0} students
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Calendar className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Attendance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance ({new Date().toLocaleDateString()})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAttendance?.map((attendance) => (
              <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {attendance.students?.users?.full_name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{attendance.students?.users?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{attendance.students?.classes?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      attendance.status === "present"
                        ? "default"
                        : attendance.status === "absent"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {attendance.status}
                  </Badge>
                  {attendance.remarks && <span className="text-sm text-muted-foreground">{attendance.remarks}</span>}
                </div>
              </div>
            ))}
            {!todayAttendance?.length && (
              <p className="text-center text-muted-foreground py-8">No attendance marked for today</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
