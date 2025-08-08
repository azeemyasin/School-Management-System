import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Redirect to appropriate dashboard based on role
  switch (user.role) {
    case "admin":
      redirect("/admin")
    case "receptionist":
      redirect("/receptionist")
    case "teacher":
      redirect("/teacher")
    case "student":
    case "parent":
      redirect("/student")
    default:
      // If role is not recognized, show a basic dashboard
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.full_name}!</h1>
            <p className="text-muted-foreground mb-4">Role: {user.role}</p>
            <p className="text-sm text-muted-foreground">
              Contact your administrator to set up proper access permissions.
            </p>
          </div>
        </div>
      )
  }
}
