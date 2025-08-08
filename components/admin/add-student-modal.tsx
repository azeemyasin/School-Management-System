// components/admin/add-student-modal.tsx
"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export function AddStudentModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    studentId: "",
    classId: "",
    parentId: "",
    dateOfBirth: "",
    emergencyContact: "",
    medicalInfo: "",
  });

  useEffect(() => {
    if (open) {
      fetchClasses();
      fetchParents();
    }
  }, [open]);

  const fetchClasses = async () => {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .order("grade_level");
    setClasses(data || []);
  };

  const fetchParents = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("role", "parent");
    setParents(data || []);
  };

  // Submit handler calls API route instead of Supabase Admin SDK
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const payload = {
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        password: formData.password,
        studentId: formData.studentId.trim(),
        classId: formData.classId || "",
        parentId: formData.parentId || "",
        dateOfBirth: formData.dateOfBirth || "",
        emergencyContact: formData.emergencyContact || "",
        medicalInfo: formData.medicalInfo || "",
      };

      // Send form data to our /api/students route
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json.error ?? `Request failed (${res.status})`);

      toast.success("Student added successfully!");
      setOpen(false);
      setFormData({
        email: "",
        fullName: "",
        password: "",
        studentId: "",
        classId: "",
        parentId: "",
        dateOfBirth: "",
        emergencyContact: "",
        medicalInfo: "",
      });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  // if (!formData.password || formData.password.length < 6) {
  //   toast.error("Password must be at least 6 characters");
  //   setLoading(false);
  //   return;
  // }
  // if (!formData.email.includes("@")) {
  //   toast.error("Enter a valid email");
  //   setLoading(false);
  //   return;
  // }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Create a new student account and profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classId">Class</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, classId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={String(cls.id)}>
                        {cls.name} (Grade {cls.grade_level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
                placeholder="Emergency contact information"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalInfo">Medical Information</Label>
              <Textarea
                id="medicalInfo"
                value={formData.medicalInfo}
                onChange={(e) =>
                  setFormData({ ...formData, medicalInfo: e.target.value })
                }
                placeholder="Any medical conditions or allergies"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
