"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

type Props = {
  userId: string;
  /** Optional: pass a handler from the page to open your edit modal directly */
  onEdit?: (userId: string) => void;
};

export default function TeacherRowActions({ userId, onEdit }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleEdit = useCallback(() => {
    if (onEdit) return onEdit(userId);
    // Fallback: fire a window event your modal host listens to
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-teacher-edit-modal", { detail: { userId } })
      );
    }
  }, [onEdit, userId]);

  const onDelete = async () => {
    if (!confirm("Delete this teacher and their auth account?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/teachers/${userId}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Delete failed");
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-x-2">
      <Button size="sm" variant="outline" onClick={handleEdit} disabled={busy}>
        <Edit className="h-4 w-4 mr-1" /> Edit
      </Button>

      <Button size="sm" variant="destructive" onClick={onDelete} disabled={busy}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
