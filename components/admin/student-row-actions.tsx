// components/admin/student-row-actions.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Eye, EyeOff, Clipboard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

type Props = { userId: string };

export default function StudentRowActions({ userId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // edit dialog state
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // show/hide stored password
  const [showPW, setShowPW] = useState(false);

  // form + supporting data
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
    rawPassword: "", // <— for viewing the stored plaintext
  });
  const [classes, setClasses] = useState<Array<{ id: string; name: string; grade_level?: number | null }>>([]);

  // Load current student + classes when dialog opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [studentRes] = await Promise.all([
          fetch(`/api/students/${userId}`),
          fetchClasses(),
        ]);
        const json = await studentRes.json();
        if (!studentRes.ok) throw new Error(json.error || "Failed to load student");

        const s = json.data;
        setForm((prev: any) => ({
          ...prev,
          fullName: s?.users?.full_name ?? "",
          email: s?.users?.email ?? "",
          password: "",
          studentId: s?.student_id ?? "",
          classId: s?.class_id ?? "",
          dateOfBirth: s?.date_of_birth ?? "",
          emergencyContact: s?.emergency_contact ?? "",
          medicalInfo: s?.medical_info ?? "",
          parentId: s?.parent_id ?? "",
          rawPassword: s?.raw_password ?? "",        // <— keep plaintext here
        }));
        setShowPW(false); // default hidden each open
      } catch (e: any) {
        toast.error(e.message || "Failed to load");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const fetchClasses = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("classes")
      .select("id,name,grade_level")
      .order("grade_level");
    if (!error) {
      setClasses((data ?? []).map((c: any) => ({ id: String(c.id), name: c.name, grade_level: c.grade_level })));
    }
    return data ?? [];
  };

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password ? form.password : undefined, // undefined = don't change auth password
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

      // If password was changed, reflect it locally too
      if (form.password) {
        setForm((p: any) => ({ ...p, rawPassword: form.password, password: "" }));
      }

      toast.success("Student updated");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this student and their auth account?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/students/${userId}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Delete failed");
      toast.success("Student deleted");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(form.rawPassword || "");
      toast.success("Password copied");
    } catch {
      toast.error("Failed to copy password");
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Edit dialog trigger */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={busy}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-1">
            {/* CURRENT PASSWORD (view only, with eye/copy) */}
            <div>
              <Label>Current Password (admin only)</Label>
              <div className="flex gap-2">
                <Input
                  type={showPW ? "text" : "password"}
                  value={form.rawPassword || ""}
                  readOnly
                />
                <Button type="button" variant="outline" onClick={() => setShowPW((v) => !v)}>
                  {showPW ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button type="button" variant="outline" onClick={copyPassword} disabled={!form.rawPassword}>
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            </div>

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
            <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete button */}
      <Button size="sm" variant="destructive" onClick={onDelete} disabled={busy}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
