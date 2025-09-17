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
  X
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

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Farm Story", url: "/story", icon: Map },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Mini Games", url: "/games", icon: Gamepad2 },
  { title: "Profile", url: "/profile", icon: User },
]

const quickItems = [
  { title: "Daily Facts", url: "/facts", icon: Lightbulb },
  { title: "Certificates", url: "/certificates", icon: Award },
]

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const location = useLocation()
  const [audioEnabled, setAudioEnabled] = useState(true)
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Top bar with close icon when expanded */}
        {!isCollapsed && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Menu</span>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close sidebar" onClick={toggleSidebar}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {!isCollapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <h2 className="text-lg font-bold text-sidebar-foreground">Harvestia</h2>
            <p className="text-sm text-sidebar-foreground/70">Agricultural Learning</p>
          </div>
        )}
        
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
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
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
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