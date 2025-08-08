import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

const toNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

export async function POST(req: Request) {
  const body = await req.json();

  const email = (body.email as string).trim().toLowerCase();
  const fullName = body.fullName as string;
  const password = body.password as string;           // <- admin provided
  const studentId = body.studentId as string;

  const classId = toNull(body.classId);
  const parentId = toNull(body.parentId);
  const dateOfBirth = toNull(body.dateOfBirth);
  const emergencyContact = toNull(body.emergencyContact);
  const medicalInfo = toNull(body.medicalInfo);

  try {
    // 1) Try to create a fresh auth user
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "student" },
    });

    let userId = created?.user?.id;

    // 2) If email already exists, link & reset password
    if (createErr) {
      if (/already been registered/i.test(createErr.message || "")) {
        const { data: list, error: listErr } =
          await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 });
        if (listErr || !list?.users?.length) throw createErr;

        const matchedUser = list.users.find((u: any) => u.email?.toLowerCase() === email);
        if (!matchedUser) throw createErr;

        userId = matchedUser.id;
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password,
          user_metadata: { full_name: fullName, role: "student" },
        });
      } else {
        throw createErr;
      }
    }

    if (!userId) throw new Error("Failed to resolve user id");

    // 3) Upsert profile
    const { error: profileErr } = await supabaseAdmin
      .from("users")
      .upsert({ id: userId, email, full_name: fullName, role: "student" }, { onConflict: "id" });
    if (profileErr) throw profileErr;

    // 4) Upsert student row (requires UNIQUE(user_id))
    const { error: studentErr } = await supabaseAdmin
      .from("students")
      .upsert({
          user_id: userId,
          student_id: studentId,
          class_id: classId,
          parent_id: parentId,
          date_of_birth: dateOfBirth,
          emergency_contact: emergencyContact,
          medical_info: medicalInfo,
          raw_password: password,
        },
        { onConflict: "user_id" }
      );
    if (studentErr) throw studentErr;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to add student" }, { status: 400 });
  }
}
