import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react"
import { AttendanceCalendar } from "@/components/admin/attendance-calendar"

export default async function AttendancePage() {
  const user = await requireRole(["admin"])
  const supabase = await createClient()

  // Get today's attendance summary
  const today = new Date().toISOString().split("T")[0]
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select(`
      *,
      students(users(full_name), classes(name))
    `)
    .eq("date", today)

  // Get attendance statistics
  const { data: attendanceStats } = await supabase
    .from("attendance")
    .select("status")
    .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const presentCount = todayAttendance?.filter((a) => a.status === "present").length || 0
  const absentCount = todayAttendance?.filter((a) => a.status === "absent").length || 0
  const lateCount = todayAttendance?.filter((a) => a.status === "late").length || 0
  const totalCount = todayAttendance?.length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Track and manage student attendance</p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Marked today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}% attendance
            </p>
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

      {/* Attendance Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceCalendar />
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
