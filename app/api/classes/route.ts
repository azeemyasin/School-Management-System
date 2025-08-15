// app/api/classes/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { requireRole } from "@/lib/auth";

type NewSubject = { name: string; teacherId?: string | null };


export async function POST(req: Request) {
  await requireRole(["admin"]);
  const body = await req.json();

  const name: string = (body.name ?? "").trim();
  const gradeLevelRaw = body.gradeLevel;
  const section: string | null =
    typeof body.section === "string" && body.section.trim() !== ""
      ? body.section.trim()
      : null;
  const teacherId: string = (body.teacherId ?? "").trim();
  const subjects: NewSubject[] = Array.isArray(body.subjects) ? body.subjects : [];

  const gradeLevel =
    typeof gradeLevelRaw === "number"
      ? gradeLevelRaw
      : Number.parseInt(String(gradeLevelRaw), 10);

  if (!name || !Number.isFinite(gradeLevel) || !teacherId) {
    return NextResponse.json(
      { error: "Name, valid Grade Level, and Class Teacher are required." },
      { status: 400 }
    );
  }

  try {
    // check class teacher exists
    const { data: t, error: tErr } = await supabaseAdmin
      .from("teachers")
      .select("id")
      .eq("id", teacherId)
      .single();
    if (tErr || !t) throw new Error("Selected teacher not found.");

    // create class and return id
    const { data: created, error: cErr } = await supabaseAdmin
      .from("classes")
      .insert({
        name,
        grade_level: gradeLevel,
        section,
        class_teacher_id: teacherId,
      })
      .select("id")
      .single();
    if (cErr) throw cErr;

    const classId = created?.id as string | undefined;
    if (!classId) throw new Error("Failed to resolve created class id.");

    // upsert subjects and link to class
    for (const s of subjects) {
      const subName = (s?.name ?? "").trim();
      if (!subName) continue;

      // find or create subject
      const { data: foundSubject, error: findErr } = await supabaseAdmin
        .from("subjects")
        .select("id")
        .ilike("name", subName)
        .maybeSingle();
      if (findErr) throw findErr;

      let subjectId = foundSubject?.id as string | undefined;
      if (!subjectId) {
        const { data: inserted, error: insErr } = await supabaseAdmin
          .from("subjects")
          .insert({ name: subName })
          .select("id")
          .single();
        if (insErr) throw insErr;
        subjectId = inserted.id;
      }

      // 1) ALWAYS insert the link WITHOUT teacher_id (works on your schema)
      const { data: link, error: linkErr } = await supabaseAdmin
        .from("class_subjects")
        .insert({ class_id: classId, subject_id: subjectId })
        .select("id")
        .single();
      if (linkErr) throw linkErr;

      // 2) BEST-EFFORT: try to update teacher_id if the column exists
      if (s.teacherId) {
        try {
          await supabaseAdmin
            .from("class_subjects")
            .update({ teacher_id: s.teacherId })
            .eq("id", link.id);
          // if teacher_id column doesn't exist, this will error; we ignore it
        } catch {
          /* ignore – column doesn't exist in current schema */
        }
      }
    }

    return NextResponse.json({ ok: true, id: classId });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to create class" },
      { status: 400 }
    );
  }
}