import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, Users, DollarSign, BookOpen } from "lucide-react"
import { EnrollmentChart } from "@/components/admin/enrollment-chart"
import { AttendanceChart } from "@/components/admin/attendance-chart"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { GradeDistributionChart } from "@/components/admin/grade-distribution-chart"

export default async function AnalyticsPage() {
  const user = await requireRole(["admin"])
  const supabase = await createClient()

  // Fetch analytics data
  const [
    { count: totalStudents },
    { count: totalTeachers },
    { count: totalClasses },
    { data: revenueData },
    { data: attendanceData },
    { data: gradeData },
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("teachers").select("*", { count: "exact", head: true }),
    supabase.from("classes").select("*", { count: "exact", head: true }),
    supabase.from("fee_records").select("amount, paid_date").eq("status", "paid"),
    supabase
      .from("attendance")
      .select("status, date")
      .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("grades").select("marks_obtained, total_marks"),
  ])

  const totalRevenue = revenueData?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0
  const avgAttendance = attendanceData?.length
    ? Math.round((attendanceData.filter((a) => a.status === "present").length / attendanceData.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into school performance</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAttendance}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses || 0}</div>
            <p className="text-xs text-muted-foreground">Across all grades</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Enrollment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <GradeDistributionChart />
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Grade 5-A</span>
                <span className="text-sm text-green-600">92% avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Grade 4-A</span>
                <span className="text-sm text-green-600">89% avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Grade 3-A</span>
                <span className="text-sm text-green-600">87% avg</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mathematics</span>
                <span className="text-sm text-blue-600">85% avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Science</span>
                <span className="text-sm text-blue-600">82% avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">English</span>
                <span className="text-sm text-blue-600">88% avg</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Collected</span>
                <span className="text-sm text-green-600">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending</span>
                <span className="text-sm text-yellow-600">15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overdue</span>
                <span className="text-sm text-red-600">7%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
