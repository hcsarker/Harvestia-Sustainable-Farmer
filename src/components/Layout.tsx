import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { AuthDialog } from "./AuthDialog"
import { FactOfTheDay } from "./FactOfTheDay"
import { Footer } from "./Footer"
import { Button } from "@/components/ui/button"
import { User, LogOut, User2 } from "lucide-react"
import { useIsFetching } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const isFetching = useIsFetching()
  const navigate = useNavigate()
  const { user, profile, isGuest, isAuthenticated, signOut } = useAuth()
  return (
    <SidebarProvider>
      {/* Hidden color preloader to ensure all critical colors are available */}
      <div className="force-color-preload">
        <div className="bg-green-500 bg-green-600 bg-blue-500 bg-blue-600 bg-purple-500 bg-purple-600"></div>
        <div className="bg-orange-500 bg-orange-600 bg-emerald-500 bg-emerald-600 bg-indigo-500 bg-indigo-600"></div>
        <div className="text-primary text-secondary text-accent"></div>
      </div>
      <div className="min-h-screen flex w-full">
        {/* Top loading heartbeat */}
        {isFetching > 0 && (
          <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-lime-400 animate-pulse" />
        )}
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Spacer for fixed heartbeat (optional) */}
          <div className="h-0" />
          {/* Header */}
          <header className="sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4">
            <SidebarTrigger className="mr-4" />
            
            <div className="flex-1" />
            
            {/* Auth & User Controls */}
            <div className="flex items-center space-x-2">
              {!isAuthenticated && !isGuest && (
                <AuthDialog />
              )}

              {isGuest && (
                <div className="text-sm text-muted-foreground mr-2">Guest Mode</div>
              )}

              {!isGuest && isAuthenticated && (
                <div className="hidden sm:block text-sm text-muted-foreground mr-1 max-w-[12rem] truncate">
                  {profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0]}
                </div>
              )}

              {(isAuthenticated || isGuest) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full px-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.display_name ?? user?.email ?? 'User'} />
                        <AvatarFallback>{(profile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}</span>
                        <span className="text-xs text-muted-foreground">{user?.email || (isGuest ? 'Guest' : '')}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User2 className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        await signOut()
                        navigate('/')
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>
          
          {/* Main Content (page scrolls, not inner container) */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer sticks to bottom even when content is short */}
          <Footer />
          
          {/* Floating Fact of the Day - only on homepage */}
          {window.location.pathname === "/" && (
            <div className="fixed bottom-6 right-6 w-80 z-50 hidden lg:block">
              <FactOfTheDay />
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  )
}