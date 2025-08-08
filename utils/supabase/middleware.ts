import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Ensure this middleware runs in a Node.js runtime rather than Edge
export const runtime = 'nodejs'

// Session updater function
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies to the incoming request first
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Then create a fresh response and populate the cookies on it
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session and get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users to the login page
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// The actual middleware function called by Next.js
export function middleware(request: NextRequest) {
  return updateSession(request)
}

// Only apply the middleware to application pages, not static assets or API routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
