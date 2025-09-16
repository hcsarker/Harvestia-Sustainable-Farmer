import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Sprout, Leaf, Sun, Droplets } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate("/")
      }
    }
    checkAuth()
  }, [navigate])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
        navigate("/")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const redirectUrl = `${window.location.origin}/`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
        })
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestMode = () => {
    toast({
      title: "Entering Guest Mode",
      description: "You can explore the app with limited features.",
    })
    navigate("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Sprout className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to Harvestia</h1>
          <p className="text-muted-foreground">
            Learn sustainable farming with NASA satellite data
          </p>
        </div>

        {/* Features Preview */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Leaf className="h-4 w-4 text-green-500" />
                <span>NASA MODIS Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>Soil Moisture SMAP</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <span>Climate Analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sprout className="h-4 w-4 text-primary" />
                <span>Interactive Learning</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Tabs */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGuestMode}
              className="w-full"
              disabled={isLoading}
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  )
}