import { createClient } from "@/utils/supabase/server"

export async function getCurrentUser() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    // Simple query without complex joins to avoid recursion
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, email, full_name, role, phone, address, created_at")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.log("Profile fetch error:", profileError)
      return null
    }

    // If no profile exists, create one
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email!.split("@")[0],
          role: (user.user_metadata?.role as any) || "student",
        })
        .select("id, email, full_name, role, phone, address, created_at")
        .single()

      if (insertError) {
        console.log("Profile creation error:", insertError)
        return null
      }
      return newProfile
    }

    return profile
  } catch (error) {
    console.error("getCurrentUser error:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions")
  }
  return user
}
