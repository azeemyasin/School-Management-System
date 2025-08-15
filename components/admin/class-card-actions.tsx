// components/admin/class-card-actions.tsx

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import EditClassModal from "@/components/admin/edit-class-modal";
import { useState } from "react";
import { toast } from "sonner";
import { AddClassModal } from "@/components/admin/add-class-modal";

type Props =
  | { mode: "add" }
  | {
      mode: "row";
      classId: string;
      initial: {
        name: string;
        gradeLevel: number;
        section: string;
        classTeacherId: string | null;
      };
    };

export default function ClassCardActions(props: Props) {
  const router = useRouter();

  if (props.mode === "add") {
    return <AddClassModal />;
  }

  const { classId, initial } = props;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!confirm("Delete this class?")) return;
    setBusy(true);
    try {
      let res = await fetch(`/api/classes/${classId}`, { method: "DELETE" });

      // If the class has enrolled students, offer Force Delete
      if (res.status === 409) {
        const json = await res.json().catch(() => ({}));
        const ok = confirm(
          `${json?.error ?? "This class has enrolled students."}\n\n` +
            "Click OK to Force Delete (students will be detached and subject assignments removed)."
        );
        if (ok) {
          res = await fetch(`/api/classes/${classId}?force=1`, { method: "DELETE" });
        }
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Delete failed");

      toast.success("Class deleted");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-2 pt-2">
      <EditClassModal open={open} onOpenChange={setOpen} classId={classId} initial={initial}>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </EditClassModal>

      <Button variant="destructive" size="sm" onClick={onDelete} disabled={busy}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
