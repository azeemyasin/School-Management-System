import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, Calendar } from "lucide-react"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"

export default async function AdminDashboard() {
  const user = await requireRole(["admin"])
  const supabase = await createClient()

  // Fetch dashboard statistics
  const [{ count: totalStudents }, { count: totalTeachers }, { count: totalClasses }, { data: recentFees }] =
    await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("teachers").select("*", { count: "exact", head: true }),
      supabase.from("classes").select("*", { count: "exact", head: true }),
      supabase.from("fee_records").select("amount").eq("status", "paid").limit(100),
    ])

  const totalRevenue = recentFees?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.full_name}. Here's what's happening at your school.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers || 0}</div>
            <p className="text-xs text-muted-foreground">+1 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses || 0}</div>
            <p className="text-xs text-muted-foreground">Across all grades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Student Enrollment Trends</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <AnalyticsChart />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">New student admission</p>
                  <p className="text-sm text-muted-foreground">John Doe enrolled in Grade 5-A</p>
                </div>
                <div className="ml-auto font-medium">2h ago</div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">Fee payment received</p>
                  <p className="text-sm text-muted-foreground">$500 payment from Sarah Wilson</p>
                </div>
                <div className="ml-auto font-medium">4h ago</div>
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-purple-600" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">New teacher added</p>
                  <p className="text-sm text-muted-foreground">Ms. Johnson joined as Math teacher</p>
                </div>
                <div className="ml-auto font-medium">1d ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
