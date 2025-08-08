// app/api/teachers/[userId]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

// helper: turn "" -> null, leave undefined alone
const toNull = (v: unknown) =>
  v === "" || v === undefined ? null : (v as any);

/** ---------- GET: load one teacher (for edit modal) ---------- */
export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;

  const { data, error } = await supabaseAdmin
    .from("teachers")
    .select(
      `
      user_id,
      employee_id,
      qualification,
      experience_years,
      salary,
      raw_password,
      users:users!inner(
        id,
        email,
        full_name,
        phone,
        address
      )
    `
    )
    .eq("user_id", userId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

/** ---------- PUT: update teacher ---------- */
export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  const body = await req.json();

  const fullName = body.fullName as string | undefined;
  const email = (body.email as string | undefined)?.toLowerCase();
  const password = body.password as string | undefined;

  const employeeId = body.employeeId as string | undefined;
  const phone = body.phone !== undefined ? toNull(body.phone) : undefined;
  const address = body.address !== undefined ? toNull(body.address) : undefined;
  const qualification =
    body.qualification !== undefined ? toNull(body.qualification) : undefined;
  const experienceYears =
    body.experienceYears !== undefined
      ? toNull(
          body.experienceYears === "" ? null : Number(body.experienceYears)
        )
      : undefined;
  const salary =
    body.salary !== undefined
      ? toNull(body.salary === "" ? null : Number(body.salary))
      : undefined;

  try {
    // Update Auth (password / email / metadata)
    if (password || email || fullName) {
      const { error: aErr } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          ...(password ? { password } : {}),
          ...(email ? { email } : {}),
          ...(fullName ? { user_metadata: { full_name: fullName } } : {}),
        }
      );
      if (aErr) throw aErr;
    }

    // Update users profile
    if (email || fullName || phone !== undefined || address !== undefined) {
      const { error: uErr } = await supabaseAdmin
        .from("users")
        .update({
          ...(email ? { email } : {}),
          ...(fullName ? { full_name: fullName } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(address !== undefined ? { address } : {}),
        })
        .eq("id", userId);
      if (uErr) throw uErr;
    }

    // Update teachers row (+ keep raw_password in sync if password changed)
    if (
      employeeId !== undefined ||
      qualification !== undefined ||
      experienceYears !== undefined ||
      salary !== undefined ||
      password !== undefined
    ) {
      const { error: tErr } = await supabaseAdmin
        .from("teachers")
        .update({
          ...(employeeId !== undefined ? { employee_id: employeeId } : {}),
          ...(qualification !== undefined ? { qualification } : {}),
          ...(experienceYears !== undefined
            ? { experience_years: experienceYears }
            : {}),
          ...(salary !== undefined ? { salary } : {}),
          ...(password !== undefined ? { raw_password: password } : {}),
        })
        .eq("user_id", userId);
      if (tErr) throw tErr;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed to update teacher" },
      { status: 400 }
    );
  }
}

/** ---------- DELETE: remove teacher & auth user ---------- */
export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;

  try {
    // Remove teacher row first (FK to users)
    const { error: tErr } = await supabaseAdmin
      .from("teachers")
      .delete()
      .eq("user_id", userId);
    if (tErr) throw tErr;

    // Remove users row
    const { error: uErr } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);
    if (uErr) throw uErr;

    // Remove auth account
    const { error: aErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (aErr) throw aErr;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed to delete teacher" },
      { status: 400 }
    );
  }
}
