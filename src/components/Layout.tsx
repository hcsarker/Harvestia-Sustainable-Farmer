import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { AuthDialog } from "./AuthDialog"
import { FactOfTheDay } from "./FactOfTheDay"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { useIsFetching } from "@tanstack/react-query"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const isFetching = useIsFetching()
  return (
    <SidebarProvider>
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
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4">
            <SidebarTrigger className="mr-4" />
            
            <div className="flex-1" />
            
            {/* Auth & User Controls */}
            <div className="flex items-center space-x-2">
              <AuthDialog />
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          
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