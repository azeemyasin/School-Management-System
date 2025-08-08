// utils/supabase/admin.ts
import { createClient } from "@supabase/supabase-js"

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,          // same URL you already use
  process.env.SUPABASE_SERVICE_ROLE_KEY!,         // SERVER-ONLY key (do not expose)
  { auth: { persistSession: false } }
)
