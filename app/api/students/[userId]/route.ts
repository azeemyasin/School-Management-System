import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

const toNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  try {
    const { data, error } = await supabaseAdmin
      .from("students")
      .select(`
        user_id,
        student_id,
        class_id,
        parent_id,
        date_of_birth,
        emergency_contact,
        medical_info,
        raw_password,
        fee,
        users:user_id ( full_name, email )
      `)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed to fetch student" },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { userId: string } }) {
  const userId = params.userId;
  const body = await req.json();

  const fullName = body.fullName as string | undefined;
  const email = (body.email as string | undefined)?.toLowerCase();
  const password = body.password as string | undefined;
  const studentId = body.studentId as string | undefined;

  const classId = body.classId !== undefined ? toNull(body.classId) : undefined;
  const parentId = body.parentId !== undefined ? toNull(body.parentId) : undefined;
  const dateOfBirth = body.dateOfBirth !== undefined ? toNull(body.dateOfBirth) : undefined;
  const emergencyContact =
    body.emergencyContact !== undefined ? toNull(body.emergencyContact) : undefined;
  const medicalInfo = body.medicalInfo !== undefined ? toNull(body.medicalInfo) : undefined;
  const fee =
    body.fee === undefined
      ? undefined
      : body.fee === null
      ? null
      : Number.isFinite(Number(body.fee))
      ? Number(body.fee)
      : null;

  try {
    if (password || email || fullName) {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ...(password ? { password } : {}),
        ...(email ? { email } : {}),
        ...(fullName ? { user_metadata: { full_name: fullName } } : {}),
      });
    }

    if (email || fullName) {
      const { error: uErr } = await supabaseAdmin
        .from("users")
        .update({
          ...(email ? { email } : {}),
          ...(fullName ? { full_name: fullName } : {}),
        })
        .eq("id", userId);
      if (uErr) throw uErr;
    }

    const studentUpdate: Record<string, any> = {};
    if (studentId !== undefined) studentUpdate.student_id = studentId;
    if (classId !== undefined) studentUpdate.class_id = classId;
    if (parentId !== undefined) studentUpdate.parent_id = parentId;
    if (dateOfBirth !== undefined) studentUpdate.date_of_birth = dateOfBirth;
    if (emergencyContact !== undefined) studentUpdate.emergency_contact = emergencyContact;
    if (medicalInfo !== undefined) studentUpdate.medical_info = medicalInfo;
    if (fee !== undefined) studentUpdate.fee = fee; // NEW
    if (typeof password === "string" && password.trim().length > 0) {
      studentUpdate.raw_password = password;
    }

    if (Object.keys(studentUpdate).length > 0) {
      const { error: sErr } = await supabaseAdmin
        .from("students")
        .update(studentUpdate)
        .eq("user_id", userId);
      if (sErr) throw sErr;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to update student" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { userId: string } }) {
  const userId = params.userId;
  try {
    const { error: sErr } = await supabaseAdmin.from("students").delete().eq("user_id", userId);
    if (sErr) throw sErr;

    const { error: uErr } = await supabaseAdmin.from("users").delete().eq("id", userId);
    if (uErr) throw uErr;

    const { error: aErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (aErr) throw aErr;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to delete student" }, { status: 400 });
  }
}
