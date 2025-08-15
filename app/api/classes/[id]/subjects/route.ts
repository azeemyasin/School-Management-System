// app/api/classes/[id]/subjects/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { requireRole } from "@/lib/auth";

type IncomingSubject = { name: string; teacherId: string };

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await requireRole(["admin"]);
  const classId = params.id;

  try {
    const body = await req.json().catch(() => ({}));
    const list: IncomingSubject[] = Array.isArray(body?.subjects)
      ? body.subjects
      : [];

    if (!classId) {
      return NextResponse.json(
        { error: "Class id is required" },
        { status: 400 }
      );
    }
    if (!list.length) {
      // No subjects to assign – just return OK
      return NextResponse.json({ ok: true });
    }

    // 1) Normalize & validate
    const clean = list
      .map((s) => ({
        name: String(s.name ?? "").trim(),
        teacherId: String(s.teacherId ?? "").trim(),
      }))
      .filter((s) => s.name && s.teacherId);

    if (!clean.length) {
      return NextResponse.json(
        { error: "Valid subjects (name + teacherId) are required." },
        { status: 400 }
      );
    }

    // 2) Ensure each subject exists in `subjects` (by name, case-insensitive)
    const subjectNameSet = Array.from(new Set(clean.map((s) => s.name)));
    // Try to fetch existing by names
    const { data: existingSubjects, error: fetchSubErr } = await supabaseAdmin
      .from("subjects")
      .select("id, name")
      .in("name", subjectNameSet);

    if (fetchSubErr) throw fetchSubErr;

    const existingMap = new Map<string, string>();
    (existingSubjects ?? []).forEach((row) => {
      existingMap.set(row.name, row.id);
    });

    const toInsert = subjectNameSet
      .filter((nm) => !existingMap.has(nm))
      .map((nm) => ({ name: nm }));

    if (toInsert.length) {
      // Insert missing subjects and get their ids
      const { data: inserted, error: insertSubErr } = await supabaseAdmin
        .from("subjects")
        .insert(toInsert)
        .select("id, name");
      if (insertSubErr) throw insertSubErr;

      (inserted ?? []).forEach((row) => existingMap.set(row.name, row.id));
    }

    // 3) Build teacher_subject rows
    const pairs = clean.map((s) => ({
      class_id: classId,
      subject_id: existingMap.get(s.name)!,
      teacher_id: s.teacherId,
    }));

    // Optional safety: remove any existing rows for (class_id, subject_id)
    // so inserts won’t duplicate and will "update" teacher assignments.
    const subjectIds = Array.from(new Set(pairs.map((p) => p.subject_id)));
    const { error: delErr } = await supabaseAdmin
      .from("teacher_subjects")
      .delete()
      .eq("class_id", classId)
      .in("subject_id", subjectIds);
    if (delErr) throw delErr;

    // 4) Insert new links
    const { error: linkErr } = await supabaseAdmin
      .from("teacher_subjects")
      .insert(pairs);
    if (linkErr) throw linkErr;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to assign subjects to class" },
      { status: 400 }
    );
  }
}
