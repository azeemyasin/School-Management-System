"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
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
import { Plus, Loader2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TeacherOpt = { id: string; name: string };

type SubjectRow = {
  key: string;          // local key
  name: string;         // subject name typed by the user
  teacherId: string;    // '' means unassigned
};

export function AddClassModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Teachers for dropdown
  const [teachers, setTeachers] = useState<TeacherOpt[]>([]);

  // Class form
  const [formData, setFormData] = useState({
    name: "",
    gradeLevel: "",
    section: "",
    teacherId: "", // required (UUID)
  });

  // Subject UI
  const [subjectInput, setSubjectInput] = useState("");
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);

  const router = useRouter();
  const supabase = createClient();

  // Fetch teachers whenever dialog opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, users:user_id(full_name)")
        .order("id", { ascending: true });

      if (error) {
        toast.error(error.message || "Failed to load teachers");
        setTeachers([]);
        return;
      }

      const opts =
        (data ?? []).map((t: any) => ({
          id: String(t.id),
          name: t.users?.full_name ?? `Teacher #${t.id}`,
        })) || [];

      setTeachers(opts);
      // Preselect first class teacher if none selected
      if (opts.length && !formData.teacherId) {
        setFormData((f) => ({ ...f, teacherId: opts[0].id }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /** Add a subject by name if valid & not duplicate */
  const addSubjectByName = (raw: string) => {
    const name = raw.trim().replace(/,+$/, "");
    if (!name) return;
    const dup = subjects.some((s) => s.name.toLowerCase() === name.toLowerCase());
    if (dup) {
      toast.info("Subject already added");
      return;
    }
    setSubjects((rows) => [
      ...rows,
      { key: crypto.randomUUID(), name, teacherId: "" },
    ]);
  };

  /** Handle subject input key presses (Enter/comma) */
  const onSubjectKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSubjectByName(subjectInput);
      setSubjectInput("");
    }
  };

  const removeSubject = (key: string) => {
    setSubjects((rows) => rows.filter((r) => r.key !== key));
  };

  const isValid = useMemo(() => {
    const nameOk = formData.name.trim().length > 0;
    const gradeNum = Number.parseInt(formData.gradeLevel, 10);
    const gradeOk = Number.isFinite(gradeNum);
    const teacherOk = !!formData.teacherId;
    return nameOk && gradeOk && teacherOk;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !isValid) return;
    setLoading(true);

    try {
      // 1) Create class
      const classPayload = {
        name: formData.name.trim(),
        gradeLevel: Number.parseInt(formData.gradeLevel, 10),
        section: formData.section.trim() || null,
        teacherId: formData.teacherId.trim(), // UUID of class teacher
      };

      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classPayload),
      });

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(json.error || "Failed to create class");

      const classId: string | undefined = json?.id;
      if (!classId) {
        // If your /api/classes doesn’t return id, please update it to return { id }
        throw new Error("Server did not return class id. Please update /api/classes to return { id }.");
      }

      // 2) If subjects were added, send them to /api/classes/:id/subjects
      // Expect API to accept: [{ subjectName, teacherId }]
      if (subjects.length > 0) {
        const payload = subjects.map((s) => ({
          subjectName: s.name,
          teacherId: s.teacherId || null,
        }));

        const subRes = await fetch(`/api/classes/${classId}/subjects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const subJson = await subRes.json().catch(() => ({}));
        if (!subRes.ok) {
          throw new Error(subJson.error || "Failed to assign subjects to class");
        }
      }

      toast.success("Class created successfully!");
      setOpen(false);
      // Reset form
      setFormData({ name: "", gradeLevel: "", section: "", teacherId: "" });
      setSubjectInput("");
      setSubjects([]);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
          <DialogDescription>Create a new class for students and optionally add subjects now.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Class meta */}
            <div className="space-y-2">
              <Label htmlFor="name">Class Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grade 5-A"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Input
                  id="gradeLevel"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="A, B, C..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Class Teacher</Label>
              <Select
                value={formData.teacherId || undefined}
                onValueChange={(v) => setFormData({ ...formData, teacherId: v })}
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
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Required — select the main class teacher.
              </p>
            </div>

            {/* Subjects manager */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Add Subjects</Label>
                {/* Existing subject rows (above input) */}
                {subjects.length > 0 && (
                  <div className="space-y-2">
                    {subjects.map((row, idx) => (
                      <div
                        key={row.key}
                        className="grid grid-cols-12 gap-3 items-center border rounded p-2"
                      >
                        <div className="col-span-5">
                          <div className="text-sm font-medium">{row.name}</div>
                          <div className="text-[11px] text-muted-foreground">Subject</div>
                        </div>

                        <div className="col-span-6">
                          <Select
                            value={row.teacherId || undefined}
                            onValueChange={(v) =>
                              setSubjects((old) => {
                                const copy = [...old];
                                copy[idx] = { ...copy[idx], teacherId: v };
                                return copy;
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Assign teacher (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => removeSubject(row.key)}
                            aria-label={`Remove ${row.name}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input to add a subject; pressing Enter or comma adds */}
                <Input
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={onSubjectKeyDown}
                  placeholder="Type a subject and press Enter (e.g., Mathematics)"
                />
                <p className="text-xs text-muted-foreground">
                  Press <strong>Enter</strong> to add. You can then assign a teacher for each subject.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isValid}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
