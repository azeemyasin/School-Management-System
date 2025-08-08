import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, DollarSign, Calendar, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function ReceptionistDashboard() {
  const user = await requireRole(["receptionist"])
  const supabase = await createClient()

  // Fetch dashboard statistics
  const [{ count: totalStudents }, { count: pendingAdmissions }, { data: pendingFees }, { data: todayAttendance }] =
    await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("fee_records").select("amount").eq("status", "pending"),
      supabase.from("attendance").select("*").eq("date", new Date().toISOString().split("T")[0]),
    ])

  const totalPendingFees = pendingFees?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Receptionist Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.full_name}. Manage admissions, fees, and communications.
        </p>
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
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Admissions</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAdmissions || 0}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPendingFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{pendingFees?.length || 0} records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendance?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Students marked</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Student Admissions</CardTitle>
            <CardDescription>Manage new student registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              New Admission
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              View Pending Applications
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Management</CardTitle>
            <CardDescription>Handle fee collections and records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">
              <DollarSign className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Generate Fee Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communications</CardTitle>
            <CardDescription>Parent and student communications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              <Phone className="mr-2 h-4 w-4" />
              Contact Log
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Admissions</CardTitle>
            <CardDescription>Latest student registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Emma Johnson</p>
                  <p className="text-sm text-muted-foreground">Grade 3-A</p>
                </div>
                <span className="text-sm text-green-600 font-medium">Approved</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">Michael Chen</p>
                  <p className="text-sm text-muted-foreground">Grade 5-B</p>
                </div>
                <span className="text-sm text-yellow-600 font-medium">Pending</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Sarah Williams</p>
                  <p className="text-sm text-muted-foreground">Grade 2-A</p>
                </div>
                <span className="text-sm text-blue-600 font-medium">Documents Required</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Status</CardTitle>
            <CardDescription>Recent payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-muted-foreground">Tuition Fee - March</p>
                </div>
                <span className="text-sm text-green-600 font-medium">$500 Paid</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">Lisa Davis</p>
                  <p className="text-sm text-muted-foreground">Activity Fee - March</p>
                </div>
                <span className="text-sm text-red-600 font-medium">$150 Overdue</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">Robert Brown</p>
                  <p className="text-sm text-muted-foreground">Transport Fee - March</p>
                </div>
                <span className="text-sm text-yellow-600 font-medium">$200 Due</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
