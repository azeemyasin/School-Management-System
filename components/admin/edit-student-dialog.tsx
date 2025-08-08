// components/admin/edit-student-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  userId: string;
  classes?: Array<{ id: string; name: string; grade_level?: number | null }>; // optional to prefill select
};

export default function EditStudentDialog({ userId, classes = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    fullName: "",
    email: "",
    password: "", // blank means "do not change"
    studentId: "",
    classId: "",
    dateOfBirth: "",
    emergencyContact: "",
    medicalInfo: "",
    parentId: "",
  });

  const router = useRouter();

  // load existing data when dialog opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch(`/api/students/${userId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load student");
        const s = json.data;
        setForm({
          fullName: s?.users?.full_name ?? "",
          email: s?.users?.email ?? "",
          password: "",
          studentId: s?.student_id ?? "",
          classId: s?.class_id ?? "",
          dateOfBirth: s?.date_of_birth ?? "",
          emergencyContact: s?.emergency_contact ?? "",
          medicalInfo: s?.medical_info ?? "",
          parentId: s?.parent_id ?? "",
        });
      } catch (e: any) {
        toast.error(e.message || "Failed to load");
      }
    })();
  }, [open, userId]);

  const onSave = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password ? form.password : undefined, // undefined = don't change
        studentId: form.studentId.trim(),
        classId: form.classId || "",
        dateOfBirth: form.dateOfBirth || "",
        emergencyContact: form.emergencyContact || "",
        medicalInfo: form.medicalInfo || "",
        parentId: form.parentId || "",
      };

      const res = await fetch(`/api/students/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Update failed");

      toast.success("Student updated");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Student ID</Label>
              <Input
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              />
            </div>
            <div>
              <Label>Class</Label>
              <Select
                value={String(form.classId || "")}
                onValueChange={(v) => setForm({ ...form, classId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} {c.grade_level ? `(Grade ${c.grade_level})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={form.dateOfBirth || ""}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <Label>Set New Password (optional)</Label>
              <Input
                type="password"
                placeholder="Leave blank to keep current"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Emergency Contact</Label>
            <Input
              value={form.emergencyContact || ""}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
            />
          </div>

          <div>
            <Label>Medical Information</Label>
            <Textarea
              value={form.medicalInfo || ""}
              onChange={(e) => setForm({ ...form, medicalInfo: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
