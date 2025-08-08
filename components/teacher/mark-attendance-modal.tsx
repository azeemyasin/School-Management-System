"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Loader2, CheckCircle, XCircle, Clock } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface MarkAttendanceModalProps {
  teacherId: string
}

export function MarkAttendanceModal({ teacherId }: MarkAttendanceModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>({})
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (open && teacherId) {
      fetchClasses()
    }
  }, [open, teacherId])

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass])

  const fetchClasses = async () => {
    const { data } = await supabase.from("teacher_subjects").select("classes(*)").eq("teacher_id", teacherId)

    const uniqueClasses =
      data?.reduce((acc: any[], item) => {
        if (!acc.find((c) => c.id === item.classes.id)) {
          acc.push(item.classes)
        }
        return acc
      }, []) || []

    setClasses(uniqueClasses)
  }

  const fetchStudents = async () => {
    const { data } = await supabase.from("students").select("*, users(full_name)").eq("class_id", selectedClass)

    setStudents(data || [])

    // Initialize attendance data
    const initialData: Record<string, { status: string; remarks: string }> = {}
    data?.forEach((student) => {
      initialData[student.id] = { status: "present", remarks: "" }
    })
    setAttendanceData(initialData)
  }

  const updateAttendance = (studentId: string, field: "status" | "remarks", value: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) throw new Error("Not authenticated")

      const today = new Date().toISOString().split("T")[0]

      // Prepare attendance records
      const attendanceRecords = students.map((student) => ({
        student_id: student.id,
        class_id: selectedClass,
        date: today,
        status: attendanceData[student.id]?.status || "present",
        remarks: attendanceData[student.id]?.remarks || null,
        marked_by: currentUser.user.id,
      }))

      // Delete existing attendance for today (if any) and insert new records
      await supabase
        .from("attendance")
        .delete()
        .eq("date", today)
        .eq("class_id", selectedClass)
        .eq("marked_by", currentUser.user.id)

      const { error } = await supabase.from("attendance").insert(attendanceRecords)

      if (error) throw error

      toast.success("Attendance marked successfully!")
      setOpen(false)
      setSelectedClass("")
      setStudents([])
      setAttendanceData({})
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to mark attendance")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>Mark attendance for students in your class.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="classId">Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} (Grade {cls.grade_level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {students.length > 0 && (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                <Label>Students Attendance</Label>
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{student.users?.full_name}</p>
                      <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={attendanceData[student.id]?.status === "present" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateAttendance(student.id, "status", "present")}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={attendanceData[student.id]?.status === "absent" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => updateAttendance(student.id, "status", "absent")}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={attendanceData[student.id]?.status === "late" ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => updateAttendance(student.id, "status", "late")}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="w-32">
                      <Textarea
                        placeholder="Remarks"
                        value={attendanceData[student.id]?.remarks || ""}
                        onChange={(e) => updateAttendance(student.id, "remarks", e.target.value)}
                        rows={1}
                        className="text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedClass || students.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark Attendance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
