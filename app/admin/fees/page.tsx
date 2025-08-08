import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, DollarSign, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddFeeModal } from "@/components/admin/add-fee-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function FeesPage() {
  const user = await requireRole(["admin"])
  const supabase = await createClient()

  const { data: feeRecords } = await supabase
    .from("fee_records")
    .select(`
      *,
      students(users(full_name), student_id, classes(name))
    `)
    .order("due_date", { ascending: false })

  // Calculate statistics
  const totalFees = feeRecords?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0
  const paidFees =
    feeRecords?.filter((fee) => fee.status === "paid").reduce((sum, fee) => sum + Number(fee.amount), 0) || 0
  const pendingFees =
    feeRecords?.filter((fee) => fee.status === "pending").reduce((sum, fee) => sum + Number(fee.amount), 0) || 0
  const overdueFees =
    feeRecords?.filter((fee) => fee.status === "overdue").reduce((sum, fee) => sum + Number(fee.amount), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground">Manage student fees and payment tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Generate Report</Button>
          <AddFeeModal />
        </div>
      </div>

      {/* Fee Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All fee records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${paidFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0}% collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${pendingFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${overdueFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Input placeholder="Search student name..." />
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Fee Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tuition">Tuition Fee</SelectItem>
                  <SelectItem value="transport">Transport Fee</SelectItem>
                  <SelectItem value="activity">Activity Fee</SelectItem>
                  <SelectItem value="library">Library Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Student</th>
                  <th className="text-left p-2">Fee Type</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Due Date</th>
                  <th className="text-left p-2">Paid Date</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Academic Year</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feeRecords?.map((fee) => (
                  <tr key={fee.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{fee.students?.users?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {fee.students?.student_id} - {fee.students?.classes?.name}
                        </p>
                      </div>
                    </td>
                    <td className="p-2">{fee.fee_type}</td>
                    <td className="p-2 font-semibold">${fee.amount}</td>
                    <td className="p-2">{new Date(fee.due_date).toLocaleDateString()}</td>
                    <td className="p-2">{fee.paid_date ? new Date(fee.paid_date).toLocaleDateString() : "-"}</td>
                    <td className="p-2">
                      <Badge
                        variant={
                          fee.status === "paid" ? "default" : fee.status === "overdue" ? "destructive" : "secondary"
                        }
                      >
                        {fee.status}
                      </Badge>
                    </td>
                    <td className="p-2">{fee.academic_year}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {fee.status !== "paid" && (
                          <Button variant="outline" size="sm">
                            Mark Paid
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!feeRecords?.length && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No fee records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
