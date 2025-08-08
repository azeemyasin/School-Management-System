// app/api/teachers/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin"; // service-role client

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body.email || "").toLowerCase().trim();
    const fullName = String(body.fullName || "").trim();
    const password = String(body.password || "");
    const phone = body.phone ?? null;
    const address = body.address ?? null;
    const employeeId = String(body.employeeId || "").trim();
    const qualification = body.qualification ?? null;
    const experienceYears =
      body.experienceYears !== "" && body.experienceYears != null
        ? Number(body.experienceYears)
        : null;
    const salary =
      body.salary !== "" && body.salary != null ? Number(body.salary) : null;

    if (!email || !fullName || !password || !employeeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1) Create auth user
    const { data: auth, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "teacher" },
    });
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });
    const uid = auth.user.id;

    // 2) Insert users row
    const { error: uErr } = await supabaseAdmin.from("users").insert({
      id: uid,
      email,
      full_name: fullName,
      role: "teacher",
      phone,
      address,
    });
    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 400 });

    // 3) Insert teachers row (and store raw password for admin view)
    const { error: tErr } = await supabaseAdmin.from("teachers").insert({
      user_id: uid,
      employee_id: employeeId,
      qualification,
      experience_years: experienceYears,
      salary,
      raw_password: password,
    });
    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 400 });

    return NextResponse.json({ ok: true, user_id: uid });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to add teacher" }, { status: 400 });
  }
}
