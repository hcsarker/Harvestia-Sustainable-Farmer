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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogIn, UserPlus, Users } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function AuthDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { enterGuestMode } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGuestMode = () => {
    enterGuestMode()
    setIsOpen(false)
    navigate("/")
  }

  const ensureProfile = async (userId: string, displayName?: string | null) => {
    try {
      const { error, status } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single()
      if (error && status !== 406 && status !== 404) {
        return
      }
      if (status === 406 || status === 404) {
        await supabase.from('profiles').upsert({
          user_id: userId,
          display_name: displayName ?? (email ? email.split('@')[0] : null),
          level: 1,
          experience_points: 0,
        })
      }
    } catch {
      // no-op
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const userId = data.session?.user?.id
      if (userId) await ensureProfile(userId)
      toast({ title: 'Signed in', description: 'Welcome back!' })
      setIsOpen(false)
      const returnTo = new URLSearchParams(location.search).get('returnTo')
      navigate(returnTo || location.pathname || '/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Please check your credentials'
      toast({ title: 'Sign in failed', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (password.length < 6) {
        toast({ title: 'Password too short', description: 'Minimum 6 characters', variant: 'destructive' })
        return
      }
      if (password !== confirmPassword) {
        toast({ title: 'Passwords do not match', variant: 'destructive' })
        return
      }
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name || undefined }, emailRedirectTo: `${window.location.origin}/` },
      })
      if (error) throw error
      const hasSession = !!data.session
      if (hasSession && data.user) {
        await ensureProfile(data.user.id, name || null)
      }
      toast({
        title: 'Sign up successful',
        description: data.session ? 'Account created! You are now signed in.' : 'Please check your email to confirm your account.',
      })
      setIsOpen(false)
      const returnTo = new URLSearchParams(location.search).get('returnTo')
      navigate(returnTo || location.pathname || '/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Please try again'
      toast({ title: 'Sign up failed', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
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
                  <Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                </div>
                <Button disabled={loading} type="submit" className="w-full">
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        toast({ title: 'Enter your email', description: 'Please provide your email to receive a reset link.', variant: 'destructive' })
                        return
                      }
                      try {
                        const redirectTo = `${window.location.origin}/reset-password`
                        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
                        if (error) throw error
                        toast({ title: 'Reset email sent', description: 'Check your inbox for a link to reset your password.' })
                        setIsOpen(false)
                      } catch (err) {
                        const message = err instanceof Error ? err.message : 'Failed to send reset email'
                        toast({ title: 'Could not send email', description: message, variant: 'destructive' })
                      }
                    }}
                    className="text-sm text-primary underline underline-offset-2"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name (optional)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input id="signup-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" required />
                </div>
                <Button disabled={loading || !email || password.length < 6 || password !== confirmPassword} type="submit" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}