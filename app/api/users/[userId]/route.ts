import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  try {
    // profile
    const { data: user, error: uErr } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .single();
    if (uErr || !user) throw uErr || new Error("User not found");

    let current_password: string | null = null;

    // try to read raw_password from the appropriate role table
    if (user.role === "student") {
      const { data } = await supabaseAdmin
        .from("students")
        .select("raw_password, student_id")
        .eq("user_id", userId)
        .single();
      current_password = data?.raw_password ?? null;
      (user as any).student_id = data?.student_id ?? null;
    } else if (user.role === "teacher") {
      const { data } = await supabaseAdmin
        .from("teachers")
        .select("raw_password, teacher_id")
        .eq("user_id", userId)
        .single();
      current_password = data?.raw_password ?? null;
      (user as any).teacher_id = data?.teacher_id ?? null;
    } else if (user.role === "receptionist") {
      const { data } = await supabaseAdmin
        .from("receptionists")
        .select("raw_password")
        .eq("user_id", userId)
        .single();
      current_password = data?.raw_password ?? null;
    }

    return NextResponse.json({ data: { ...user, current_password } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to fetch user" }, { status: 400 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  const body = await req.json();

  const fullName: string | undefined = body.fullName;
  const email: string | undefined = body.email?.toLowerCase();
  const password: string | undefined = body.password;
  const role: string | undefined = body.role; // admin/teacher/student/receptionist/parent

  try {
    // 1) Update Auth
    if (password || email || fullName) {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ...(password ? { password } : {}),
        ...(email ? { email } : {}),
        ...(fullName ? { user_metadata: { full_name: fullName } } : {}),
      });
    }

    // 2) Update profile row
    if (email || fullName || role) {
      const { error: uErr } = await supabaseAdmin
        .from("users")
        .update({
          ...(email ? { email } : {}),
          ...(fullName ? { full_name: fullName } : {}),
          ...(role ? { role } : {}),
        })
        .eq("id", userId);
      if (uErr) throw uErr;
    }

    // 3) If password provided, mirror it to role table plaintext (if table exists)
    if (typeof password === "string" && password.trim().length > 0) {
      // get current role (maybe changed above)
      const { data: u2, error: rErr } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();
      if (rErr) throw rErr;

      if (u2?.role === "student") {
        await supabaseAdmin.from("students").update({ raw_password: password }).eq("user_id", userId);
      } else if (u2?.role === "teacher") {
        await supabaseAdmin.from("teachers").update({ raw_password: password }).eq("user_id", userId);
      } else if (u2?.role === "receptionist") {
        await supabaseAdmin.from("receptionists").update({ raw_password: password }).eq("user_id", userId);
      }
      // for admin/parent we do not store plaintext
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to update user" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  try {
    // remove role rows (ignore errors if missing)
    await supabaseAdmin.from("students").delete().eq("user_id", userId);
    await supabaseAdmin.from("teachers").delete().eq("user_id", userId);
    await supabaseAdmin.from("receptionists").delete().eq("user_id", userId);

    // remove profile
    await supabaseAdmin.from("users").delete().eq("id", userId);

    // remove auth user
    const { error: aErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (aErr) throw aErr;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to delete user" }, { status: 400 });
  }
}
