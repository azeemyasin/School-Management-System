import { requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Edit, Trash2, Bell, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddAnnouncementModal } from "@/components/admin/add-announcement-modal"

export default async function AnnouncementsPage() {
  const user = await requireRole(["admin"])
  const supabase = await createClient()

  const { data: announcements } = await supabase
    .from("announcements")
    .select(`
      *,
      users:created_by(full_name)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Manage school-wide communications and notices</p>
        </div>
        <AddAnnouncementModal />
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Search announcements..." />
            </div>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="grid gap-4">
        {announcements?.map((announcement) => (
          <Card key={announcement.id} className={announcement.is_urgent ? "border-red-200 bg-red-50" : ""}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.is_urgent ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Bell className="h-5 w-5 text-blue-600" />
                    )}
                    <h3 className="text-lg font-semibold">{announcement.title}</h3>
                    {announcement.is_urgent && <Badge variant="destructive">Urgent</Badge>}
                  </div>
                  <p className="text-muted-foreground mb-4">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By: {announcement.users?.full_name}</span>
                    <span>Created: {new Date(announcement.created_at).toLocaleDateString()}</span>
                    {announcement.expires_at && (
                      <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {announcement.target_roles?.map((role: string) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!announcements?.length && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
            <p className="text-muted-foreground mb-4">Create your first announcement to communicate with the school.</p>
            <AddAnnouncementModal />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
