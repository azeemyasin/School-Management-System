// app/api/classes/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { requireRole } from "@/lib/auth";

type EditSubject = { name: string; teacherId?: string | null };

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await requireRole(["admin"]);
  const { id } = params;

  const { data, error } = await supabaseAdmin
    .from("classes")
    .select(
      `
      *,
      class_teacher:class_teacher_id ( id, users ( full_name ) ),
      class_subjects:class_subjects (
        id,
        teacher_id,
        teachers!class_subjects_teacher_id_fkey ( id, users ( full_name ) ),
        subjects!class_subjects_subject_id_fkey ( id, name )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await requireRole(["admin"]);
  const { id } = params;
  const body = await req.json();

  const name: string | undefined = body.name?.trim();
  const gradeLevelRaw = body.gradeLevel;
  const grade_level =
    typeof gradeLevelRaw === "number"
      ? gradeLevelRaw
      : Number.parseInt(String(gradeLevelRaw ?? ""), 10);
  const section: string | null | undefined =
    body.section === undefined ? undefined : (body.section?.trim?.() || null);
  const class_teacher_id: string | null | undefined =
    body.classTeacherId === undefined ? undefined : (body.classTeacherId || null);

  const subjects: EditSubject[] | undefined = Array.isArray(body.subjects)
    ? body.subjects
    : undefined;

  try {
    // update class base fields
    const update: Record<string, any> = {};
    if (name !== undefined) update.name = name;
    if (Number.isFinite(grade_level)) update.grade_level = grade_level;
    if (section !== undefined) update.section = section;
    if (class_teacher_id !== undefined) update.class_teacher_id = class_teacher_id;

    if (Object.keys(update).length) {
      const { error } = await supabaseAdmin.from("classes").update(update).eq("id", id);
      if (error) throw error;
    }

    // reconcile subjects (works even if teacher_id column doesn't exist)
    if (subjects) {
      const { data: currentLinks, error: curErr } = await supabaseAdmin
        .from("class_subjects")
        .select(
          `
          id,
          subject_id,
          subjects!class_subjects_subject_id_fkey ( id, name )
        `
        )
        .eq("class_id", id);
      if (curErr) throw curErr;

      const byName = new Map<string, (typeof currentLinks)[number]>();
      for (const row of currentLinks ?? []) {
        const subjectObj = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects;
        const nm = subjectObj?.name?.toLowerCase?.() ?? "";
        if (nm) byName.set(nm, row);
      }

      const wanted = new Set<string>();

      for (const s of subjects) {
        const subName = (s?.name ?? "").trim();
        if (!subName) continue;
        wanted.add(subName.toLowerCase());

        // ensure subject exists
        const { data: foundSubject, error: findErr } = await supabaseAdmin
          .from("subjects")
          .select("id")
          .ilike("name", subName)
          .maybeSingle();
        if (findErr) throw findErr;

        let subjectId = foundSubject?.id as string | undefined;
        if (!subjectId) {
          const { data: ins, error: insErr } = await supabaseAdmin
            .from("subjects")
            .insert({ name: subName })
            .select("id")
            .single();
          if (insErr) throw insErr;
          subjectId = ins.id;
        }

        const existing = byName.get(subName.toLowerCase());
        if (existing) {
          // best-effort teacher update
          if (s.teacherId) {
            try {
              await supabaseAdmin
                .from("class_subjects")
                .update({ teacher_id: s.teacherId || null })
                .eq("id", existing.id);
            } catch {/* ignore if column missing */}
          }
        } else {
          // insert link without teacher_id (works with your schema)
          const { data: link, error: linkErr } = await supabaseAdmin
            .from("class_subjects")
            .insert({ class_id: id, subject_id: subjectId })
            .select("id")
            .single();
          if (linkErr) throw linkErr;

          // best-effort teacher update
          if (s.teacherId) {
            try {
              await supabaseAdmin
                .from("class_subjects")
                .update({ teacher_id: s.teacherId || null })
                .eq("id", link.id);
            } catch {/* ignore */}
          }
        }
      }

      // delete removed subjects
      for (const row of currentLinks ?? []) {
        const subjectObj = Array.isArray(row.subjects) ? row.subjects[0] : row.subjects;
        const nm = subjectObj?.name?.toLowerCase?.();
        if (nm && !wanted.has(nm)) {
          const { error: delErr } = await supabaseAdmin
            .from("class_subjects")
            .delete()
            .eq("id", row.id);
          if (delErr) throw delErr;
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed to update class" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await requireRole(["admin"]);
  const { id } = params;
  try {
    // If FK from students -> classes blocks this, you’ll see an error.
    // Either move students to null class first or add ON DELETE SET NULL on that FK.
    const { error } = await supabaseAdmin.from("classes").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to delete class" }, { status: 400 });
  }
}
