import { useState } from "react"
import {
  Home,
  BookOpen,
  Gamepad2,
  User,
  Map,
  Lightbulb,
  Award,
  Volume2,
  VolumeX,
  Brain,
  FlaskConical,
  Sprout,
  LayoutDashboard,
  Sparkles,
  BarChart2,
  X,
  Settings,
  Shield,
  Activity
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useMemo } from "react"

// Define navigation items
const getMainItems = () => [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Story Journey", url: "/story", icon: Map },
  { title: "Simulation", url: "/simulation", icon: FlaskConical },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Mini Games", url: "/mini-games", icon: Gamepad2 },
  { title: "Quizzes", url: "/quizzes", icon: Brain },
  { title: "Profile", url: "/profile", icon: User },
]

const getQuickItems = () => [
  { title: "Facts", url: "/facts", icon: Lightbulb },
  { title: "Certificates", url: "/certificates", icon: Award },
  { title: "My Results", url: "/results", icon: BarChart2 },
]

const adminItems = [
  { title: "Quiz Admin", url: "/admin/quizzes", icon: Brain },
  { title: "Course Admin", url: "/admin/courses", icon: Settings },
  { title: "System Health", url: "/admin/health", icon: Activity },
]

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const location = useLocation()
  const [audioEnabled, setAudioEnabled] = useState(true)
  const { user, isGuest } = useAuth()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"
  
  // Get navigation items
  const mainItems = getMainItems()
  const quickItems = getQuickItems()

  // Check if user is admin
  const isAdmin = useMemo(() => {
    if (!user || isGuest) return false
    const allowRaw = (import.meta as unknown as { env: Record<string, string | undefined> }).env?.VITE_ADMIN_EMAILS
    const allowList = (allowRaw || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    const email = user.email?.toLowerCase() || ''
    return allowList.length ? allowList.includes(email) : false
  }, [user, isGuest])

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {!isCollapsed && (
          <div className="px-3 py-2 border-b border-sidebar-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-emerald-50">
                  <Sprout className="h-4 w-4" />
                </span>
                Harvestia
              </h2>
              <p className="text-sm text-sidebar-foreground/70">Agricultural Learning</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close sidebar" onClick={toggleSidebar}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="flex items-center gap-2"><LayoutDashboard className="h-3 w-3" /> Main Navigation</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="flex items-center gap-2"><Sparkles className="h-3 w-3" /> Quick Access</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only visible to admin users */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase text-sidebar-foreground/70">
              <Shield className="h-4 w-4 mr-2" />
              {!isCollapsed && "Admin Panel"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={getNavCls({ isActive: isActive(item.url) })}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!isCollapsed && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="w-full"
            >
              {audioEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
              {audioEnabled ? "Mute Audio" : "Enable Audio"}
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}