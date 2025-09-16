import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, UserPlus, Users } from "lucide-react"

export function AuthDialog() {
  const [isOpen, setIsOpen] = useState(false)

  const handleGuestMode = () => {
    // Set guest mode - would integrate with Supabase
    console.log("Guest mode activated")
    setIsOpen(false)
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    // Sign in logic - would integrate with Supabase
    console.log("Sign in attempted")
    setIsOpen(false)
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    // Sign up logic - would integrate with Supabase
    console.log("Sign up attempted")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Harvestia</DialogTitle>
          <DialogDescription>
            Sign in to save your progress and unlock all features, or continue as a guest.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Guest Mode
              </CardTitle>
              <CardDescription className="text-xs">
                Try Harvestia without creating an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGuestMode} className="w-full" variant="secondary">
                Continue as Guest
              </Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" type="password" placeholder="Enter your password" />
                </div>
                <Button type="submit" className="w-full">Sign In</Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input id="signup-name" type="text" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" placeholder="Create a password" />
                </div>
                <Button type="submit" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}