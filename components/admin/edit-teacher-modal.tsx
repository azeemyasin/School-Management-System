// components/admin/edit-teacher-modal.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type TeacherRecord = {
  user_id: string;
  employee_id: string | null;
  qualification: string | null;
  experience_years: number | null;
  salary: number | null;
  raw_password: string | null;
  users: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    address: string | null;
  };
};

export default function EditTeacherModal({
  userId,
  open,
  onOpenChange,
}: {
  userId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<TeacherRecord | null>(null);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open || !userId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/teachers/${userId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load teacher");
        setRecord(json);
      } catch (e: any) {
        toast.error(e.message || "Failed to load teacher");
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, userId, onOpenChange]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    employeeId: "",
    phone: "",
    salary: "",
    qualification: "",
    experienceYears: "",
    address: "",
  });

  useEffect(() => {
    if (!record) return;
    setForm({
      fullName: record.users.full_name ?? "",
      email: record.users.email ?? "",
      password: record.raw_password ?? "",
      employeeId: record.employee_id ?? "",
      phone: record.users.phone ?? "",
      salary: record.salary != null ? String(record.salary) : "",
      qualification: record.qualification ?? "",
      experienceYears: record.experience_years != null ? String(record.experience_years) : "",
      address: record.users.address ?? "",
    });
  }, [record]);

  const disabled = useMemo(() => loading || !record, [loading, record]);

  const save = async () => {
    if (!record) return;
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password ?? "",
        employeeId: form.employeeId.trim(),
        phone: form.phone.trim(),
        salary: form.salary ? Number(form.salary) : null,
        qualification: form.qualification.trim(),
        experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
        address: form.address.trim(),
      };

      const res = await fetch(`/api/teachers/${record.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Update failed");

      toast.success("Teacher updated");
      onOpenChange(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>Update teacher account and profile.</DialogDescription>
        </DialogHeader>

        {/* form grid similar to your Add popup */}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex gap-2">
                <Input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  disabled={disabled}
                />
                <Button type="button" variant="outline" onClick={() => setShowPw((v) => !v)} disabled={disabled}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input
                value={form.employeeId}
                onChange={(e) => setForm((s) => ({ ...s, employeeId: e.target.value }))}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Salary</Label>
              <Input
                type="number"
                step="0.01"
                value={form.salary}
                onChange={(e) => setForm((s) => ({ ...s, salary: e.target.value }))}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Qualification</Label>
            <Input
              value={form.qualification}
              onChange={(e) => setForm((s) => ({ ...s, qualification: e.target.value }))}
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Experience (Years)</Label>
              <Input
                type="number"
                value={form.experienceYears}
                onChange={(e) => setForm((s) => ({ ...s, experienceYears: e.target.value }))}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={save} disabled={disabled}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
