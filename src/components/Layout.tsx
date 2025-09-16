import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { AuthDialog } from "./AuthDialog"
import { FactOfTheDay } from "./FactOfTheDay"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
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