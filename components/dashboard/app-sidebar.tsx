// components/dashboard/app-sidebar.tsx
"use client"

import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  BarChart3,
  Bell,
  UserCheck,
  ClipboardList,
  Award,
  MessageSquare,
  UserCog,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UserNav } from "./user-nav"
import Link from "next/link"

interface AppSidebarProps {
  userRole: string
}

const menuItems = {
  admin: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Students",
      url: "/admin/students",
      icon: Users,
    },
    {
      title: "Users",
      url: "/admin/users",        
      icon: UserCog                 
    },
    {
      title: "Teachers",
      url: "/admin/teachers",
      icon: UserCheck,
    },
    {
      title: "Classes",
      url: "/admin/classes",
      icon: BookOpen,
    },
    {
      title: "Subjects",
      url: "/admin/subjects",
      icon: ClipboardList,
    },
    {
      title: "Attendance",
      url: "/admin/attendance",
      icon: Calendar,
    },
    {
      title: "Grades",
      url: "/admin/grades",
      icon: Award,
    },
    {
      title: "Fees",
      url: "/admin/fees",
      icon: DollarSign,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Announcements",
      url: "/admin/announcements",
      icon: Bell,
    },
  ],
  receptionist: [
    {
      title: "Dashboard",
      url: "/receptionist",
      icon: LayoutDashboard,
    },
    {
      title: "Students",
      url: "/receptionist/students",
      icon: Users,
    },
    {
      title: "Admissions",
      url: "/receptionist/admissions",
      icon: UserCheck,
    },
    {
      title: "Fees",
      url: "/receptionist/fees",
      icon: DollarSign,
    },
    {
      title: "Attendance",
      url: "/receptionist/attendance",
      icon: Calendar,
    },
    {
      title: "Communications",
      url: "/receptionist/communications",
      icon: MessageSquare,
    },
  ],
  teacher: [
    {
      title: "Dashboard",
      url: "/teacher",
      icon: LayoutDashboard,
    },
    {
      title: "My Classes",
      url: "/teacher/classes",
      icon: BookOpen,
    },
    {
      title: "Students",
      url: "/teacher/students",
      icon: Users,
    },
    {
      title: "Attendance",
      url: "/teacher/attendance",
      icon: Calendar,
    },
    {
      title: "Grades",
      url: "/teacher/grades",
      icon: Award,
    },
    {
      title: "Timetable",
      url: "/teacher/timetable",
      icon: ClipboardList,
    },
  ],
  student: [
    {
      title: "Dashboard",
      url: "/student",
      icon: LayoutDashboard,
    },
    {
      title: "My Grades",
      url: "/student/grades",
      icon: Award,
    },
    {
      title: "Attendance",
      url: "/student/attendance",
      icon: Calendar,
    },
    {
      title: "Timetable",
      url: "/student/timetable",
      icon: ClipboardList,
    },
    {
      title: "Fees",
      url: "/student/fees",
      icon: DollarSign,
    },
    {
      title: "Announcements",
      url: "/student/announcements",
      icon: Bell,
    },
  ],
  parent: [
    {
      title: "Dashboard",
      url: "/student",
      icon: LayoutDashboard,
    },
    {
      title: "Child's Grades",
      url: "/student/grades",
      icon: Award,
    },
    {
      title: "Attendance",
      url: "/student/attendance",
      icon: Calendar,
    },
    {
      title: "Timetable",
      url: "/student/timetable",
      icon: ClipboardList,
    },
    {
      title: "Fees",
      url: "/student/fees",
      icon: DollarSign,
    },
    {
      title: "Announcements",
      url: "/student/announcements",
      icon: Bell,
    },
  ],
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const items = menuItems[userRole as keyof typeof menuItems] || []

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">EduManage</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  )
}
