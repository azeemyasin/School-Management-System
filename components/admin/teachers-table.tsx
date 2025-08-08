// components/admin/teachers-table.tsx
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TeacherRowActions from "@/components/admin/teacher-row-actions";
import PasswordCell from "@/components/admin/password-cell";
import EditTeacherModal from "@/components/admin/edit-teacher-modal";

export type TeacherRow = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  subjects: string[];
  password: string;
};

export default function TeachersTable({ rows }: { rows: TeacherRow[] }) {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Password</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.userId}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell>{r.email}</TableCell>
              <TableCell>{r.phone || "—"}</TableCell>
              <TableCell>
                <Badge variant="secondary">{r.employeeId}</Badge>
              </TableCell>
              <TableCell>{r.subjects.length ? r.subjects.join(", ") : "—"}</TableCell>
              <TableCell>
                <PasswordCell value={r.password} />
              </TableCell>
              <TableCell className="text-right">
                <TeacherRowActions
                  userId={r.userId}
                  onEdit={(id) => {
                    setSelectedId(id);
                    setEditOpen(true);
                  }}
                />
              </TableCell>
            </TableRow>
          ))}

          {!rows.length && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No teachers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Inline edit modal – opens from the Edit button */}
      <EditTeacherModal userId={selectedId} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
