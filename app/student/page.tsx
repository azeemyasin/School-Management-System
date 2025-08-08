import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Award, DollarSign, Bell, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function StudentDashboard() {
  const user = await requireRole(["student", "parent"])
  const supabase = await createClient()

  // Get student data
  const { data: student } = await supabase
    .from("students")
    .select(`
      *,
      classes(name, grade_level),
      users:user_id(full_name)
    `)
    .or(`user_id.eq.${user.id},parent_id.eq.${user.id}`)
    .single()

  // Get recent grades
  const { data: recentGrades } = await supabase
    .from("grades")
    .select(`
      *,
      subjects(name, code)
    `)
    .eq("student_id", student?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get attendance stats
  const { data: attendanceStats } = await supabase
    .from("attendance")
    .select("status")
    .eq("student_id", student?.id)
    .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const presentDays = attendanceStats?.filter((a) => a.status === "present").length || 0
  const totalDays = attendanceStats?.length || 0
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  // Get fee records
  const { data: feeRecords } = await supabase
    .from("fee_records")
    .select("*")
    .eq("student_id", student?.id)
    .order("due_date", { ascending: false })
    .limit(3)

  const pendingFees = feeRecords?.filter((f) => f.status === "pending") || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{user.role === "parent" ? "Parent Dashboard" : "Student Dashboard"}</h1>
        <p className="text-muted-foreground">
          {user.role === "parent"
            ? `Monitoring ${student?.users?.full_name}'s academic progress`
            : `Welcome back, ${user.full_name}. Here's your academic overview.`}
        </p>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">{student?.users?.full_name?.charAt(0) || "S"}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{student?.users?.full_name}</h2>
              <p className="text-muted-foreground">Student ID: {student?.student_id}</p>
              <Badge variant="secondary">
                {student?.classes?.name} (Grade {student?.classes?.grade_level})
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {presentDays}/{totalDays} days present
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Grades</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentGrades?.length || 0}</div>
            <p className="text-xs text-muted-foreground">New grades this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFees.length}</div>
            <p className="text-xs text-muted-foreground">
              ${pendingFees.reduce((sum, fee) => sum + Number(fee.amount), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Grades and Attendance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Grades</CardTitle>
            <CardDescription>Your latest academic performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGrades?.map((grade) => (
                <div key={grade.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{grade.subjects?.name}</p>
                    <p className="text-sm text-muted-foreground">{grade.exam_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {grade.marks_obtained}/{grade.total_marks}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((grade.marks_obtained / grade.total_marks) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
              {!recentGrades?.length && (
                <p className="text-center text-muted-foreground py-4">No grades available yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Status</CardTitle>
            <CardDescription>Your payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeRecords?.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{fee.fee_type}</p>
                    <p className="text-sm text-muted-foreground">Due: {new Date(fee.due_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${fee.amount}</p>
                    <Badge variant={fee.status === "paid" ? "default" : "destructive"}>{fee.status}</Badge>
                  </div>
                </div>
              ))}
              {!feeRecords?.length && (
                <p className="text-center text-muted-foreground py-4">No fee records available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button className="p-4 text-left rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">View Timetable</p>
                  <p className="text-sm text-muted-foreground">Check class schedule</p>
                </div>
              </div>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">All Grades</p>
                  <p className="text-sm text-muted-foreground">View complete report</p>
                </div>
              </div>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium">Pay Fees</p>
                  <p className="text-sm text-muted-foreground">Make online payment</p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
