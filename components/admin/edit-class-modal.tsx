// components/admin/edit-class-modal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = PropsWithChildren<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classId: string;
  initial: {
    name: string;
    gradeLevel: number;
    section: string;
    classTeacherId: string | null;
  };
}>;

type TeacherOpt = { id: string; name: string };
type SubRow = { key: string; name: string; teacherId: string | null };

export default function EditClassModal({
  children,
  open,
  onOpenChange,
  classId,
  initial,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<TeacherOpt[]>([]);
  const [form, setForm] = useState({
    name: initial.name,
    gradeLevel: String(initial.gradeLevel ?? ""),
    section: initial.section ?? "",
    classTeacherId: initial.classTeacherId ?? "",
  });

  // subject rows in the UI
  const [subjectRows, setSubjectRows] = useState<SubRow[]>([]);
  const [newSubject, setNewSubject] = useState("");

  // Load teachers + current class subjects when modal opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        // teachers
        const { data: tdata, error: terr } = await supabase
          .from("teachers")
          .select("id, users:user_id(full_name)")
          .order("id");
        if (terr) throw terr;
        setTeachers(
          (tdata ?? []).map((t: any) => ({
            id: String(t.id),
            name: t.users?.full_name ?? "Unnamed",
          }))
        );

        // class with class_subjects
        const res = await fetch(`/api/classes/${classId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch class");

        const cs: any[] = json?.data?.class_subjects ?? [];
        const mapped: SubRow[] = cs.map((row) => ({
          key: String(row.id), // stable key
          name: row?.subjects?.name ?? "",
          teacherId: row?.teacher_id ?? null,
        }));
        setSubjectRows(mapped);
      } catch (e: any) {
        toast.error(e.message || "Failed to load class details");
        setSubjectRows([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addSubject = () => {
    const nm = newSubject.trim();
    if (!nm) return;
    // avoid duplicates by name
    if (subjectRows.some((r) => r.name.toLowerCase() === nm.toLowerCase())) {
      setNewSubject("");
      return;
    }
    setSubjectRows((rows) => [
      ...rows,
      { key: `tmp-${Date.now()}`, name: nm, teacherId: null },
    ]);
    setNewSubject("");
  };

  const removeSubject = (key: string) => {
    setSubjectRows((rows) => rows.filter((r) => r.key !== key));
  };

  const isValid = useMemo(() => {
    const nameOk = form.name.trim().length > 0;
    const gradeNum = Number.parseInt(form.gradeLevel, 10);
    const gradeOk = Number.isFinite(gradeNum);
    return nameOk && gradeOk;
  }, [form]);

  const onSave = async () => {
    if (loading || !isValid) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        gradeLevel: Number.parseInt(form.gradeLevel, 10),
        section: form.section.trim() || null,
        classTeacherId: form.classTeacherId || null,
        subjects: subjectRows.map((r) => ({
          name: r.name,
          teacherId: r.teacherId || null,
        })),
      };

      const res = await fetch(`/api/classes/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Update failed");

      toast.success("Class updated");
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
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>
            Update class details and manage subjects/teachers.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Class Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grade Level</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={form.gradeLevel}
                onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Input
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="A, B, C…"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Class Teacher</Label>
            <Select
              value={form.classTeacherId || undefined}
              onValueChange={(v) => setForm({ ...form, classTeacherId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
                <SelectItem value="none">— No teacher —</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Add / Manage Subjects</Label>

            {/* Existing subject rows */}
            <div className="space-y-2">
              {subjectRows.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No subjects assigned yet.
                </p>
              )}

              {subjectRows.map((row) => (
                <div key={row.key} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{row.name}</div>
                    <div className="text-xs text-muted-foreground">Subject</div>
                  </div>
                  <div className="w-[220px]">
                    <Select
                      value={row.teacherId || undefined}
                      onValueChange={(v) =>
                        setSubjectRows((rows) =>
                          rows.map((r) =>
                            r.key === row.key ? { ...r, teacherId: v } : r
                          )
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="none">— No teacher —</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Remove subject"
                    onClick={() => removeSubject(row.key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new subject input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a subject and press Enter (e.g., Mathematics)"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubject();
                  }
                }}
              />
              <Button type="button" onClick={addSubject}>
                Add
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Press <span className="font-medium">Enter</span> to add. Then assign a teacher for each subject.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={loading || !isValid}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
