"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Eye, EyeOff, Clipboard } from "lucide-react";
import { toast } from "sonner";

type Props = { userId: string; role: string };

export default function UserRowActions({ userId, role }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPW, setShowPW] = useState(false);

  const [form, setForm] = useState<any>({
    fullName: "",
    email: "",
    role: role,
    newPassword: "",
    currentPassword: "", // plaintext from role table if available
    studentId: "",
    teacherId: "",
  });

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load user");
        const u = json.data;

        setForm({
          fullName: u.full_name ?? "",
          email: u.email ?? "",
          role: u.role ?? "student",
          newPassword: "",
          currentPassword: u.current_password ?? "", // provided by API if present
          studentId: u.student_id ?? "",
          teacherId: u.teacher_id ?? "",
        });
        setShowPW(false);
      } catch (e: any) {
        toast.error(e.message || "Failed to load user");
      }
    })();
  }, [open, userId]);

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.newPassword ? form.newPassword : undefined,
      };

      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Update failed");

      if (form.newPassword) {
        setForm((p: any) => ({ ...p, currentPassword: form.newPassword, newPassword: "" }));
      }

      toast.success("User updated");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this user and their auth account?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Delete failed");
      toast.success("User deleted");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(form.currentPassword || "");
      toast.success("Password copied");
    } catch {
      toast.error("Failed to copy password");
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={busy}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 max-h-[70vh] overflow-y-auto pr-1">
            {/* Current plaintext (if your schema stores it for this role) */}
            {form.currentPassword ? (
              <div>
                <Label>Current Password (admin only)</Label>
                <div className="flex gap-2">
                  <Input type={showPW ? "text" : "password"} value={form.currentPassword} readOnly />
                  <Button type="button" variant="outline" onClick={() => setShowPW(v => !v)}>
                    {showPW ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button type="button" variant="outline" onClick={copyPassword}>
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="teacher">teacher</SelectItem>
                    <SelectItem value="student">student</SelectItem>
                    <SelectItem value="receptionist">receptionist</SelectItem>
                    <SelectItem value="parent">parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Set New Password (optional)</Label>
                <Input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button size="sm" variant="destructive" onClick={onDelete} disabled={busy}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
