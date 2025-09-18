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
import { useLocation, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL || !!import.meta.env.VITE_SUPABASE_PROJECT_ID
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY || !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  const missingEnv = !(hasUrl && hasKey)
  
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const redirectPath = searchParams.get('redirect') || '/'
  const { toast } = useToast()
  const { enterGuestMode } = useAuth()
  // const isDev = import.meta.env.DEV

  const mapSupabaseAuthError = (raw: unknown, ctx: 'signin' | 'signup') => {
    const msg = typeof raw === 'string' ? raw : (raw as { message?: string })?.message || 'Unexpected error'
    const lower = msg.toLowerCase()
    if (lower.includes('signups not allowed')) {
      return 'Sign-ups are disabled in this project. Enable Email provider and allow new users in Supabase Auth → Providers.'
    }
    if (lower.includes('already registered')) {
      return 'This email is already registered. Try signing in or resetting your password.'
    }
    if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
      return 'Invalid email or password. Double-check and try again, or reset your password.'
    }
    if (lower.includes('email not confirmed')) {
      return 'Email not confirmed yet. Check your inbox or click Resend Confirmation.'
    }
    if (lower.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.'
    }
    if (ctx === 'signup' && lower.includes('invalid email')) {
      return 'Invalid email address. Please enter a valid email.'
    }
    return msg
  }

  // Verify DB linkage by checking/creating a profiles row for the current user
  const verifyAndEnsureProfile = async () => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr) {
        console.warn('[Auth] verify profile: getUser error', userErr)
        return
      }
      const user = userRes.user
      if (!user) return

      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (error) {
        console.warn('[Auth] verify profile: select error', error)
        toast({ title: 'DB check', description: `Profiles query failed: ${error.message}` })
        return
      }

      if (!count || count === 0) {
        const displayName = user.email ? user.email.split('@')[0] : null
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          user_id: user.id,
          display_name: displayName,
          level: 1,
          experience_points: 0,
        })
        if (upsertErr) {
          console.warn('[Auth] verify profile: upsert error', upsertErr)
          toast({ title: 'DB check', description: `Created profile failed: ${upsertErr.message}` })
          return
        }
        toast({ title: 'DB check', description: 'Profile created successfully.' })
      } else {
        toast({ title: 'DB check', description: 'Profile exists and is readable.' })
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.warn('[Auth] verify profile: exception', msg)
      toast({ title: 'DB check', description: `Exception: ${msg}` })
    }
  }

  useEffect(() => {
    // Check if user is already authenticated (only if env present)
    if (missingEnv) return
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
  navigate(redirectPath)
      }
    }
    checkAuth()
  }, [navigate, missingEnv, redirectPath])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (missingEnv) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart the dev server.')
        return
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[Auth] signIn error', error)
        setError(mapSupabaseAuthError(error.message, 'signin'))
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
        // Post-auth DB verification (only when we have a session)
        await verifyAndEnsureProfile()
  navigate(redirectPath)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setInfo("")

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
      if (missingEnv) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart the dev server.')
        return
      }
      const redirectUrl = `${window.location.origin}/`

      const { data, error } = await supabase.auth.signUp({
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
        console.error('[Auth] signUp error', error)
        setError(mapSupabaseAuthError(error.message, 'signup'))
      } else {
        // If email confirmations are off, Supabase may return a session
        if (data?.session) {
          toast({ title: 'Account created!', description: 'You are now signed in.' })
          // Post-auth DB verification
          await verifyAndEnsureProfile()
          navigate('/')
        } else {
          setInfo('Account created. Please check your email to confirm your account. If you did not receive it, click Resend Confirmation and verify URL settings in Supabase Auth → URL Configuration.')
          toast({ title: 'Account created!', description: 'Check your email to confirm your account.' })
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setIsLoading(true)
    setError('')
    try {
      if (missingEnv) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart the dev server.')
        return
      }
      const redirectUrl = `${window.location.origin}/`
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl }
      })
      if (error) setError(error.message)
      else toast({ title: 'Magic link sent', description: 'Check your email to sign in.' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send magic link'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    // Per request, only navigate to reset page
    navigate('/reset-password')
  }

  

  const handleResendConfirmation = async () => {
    setIsLoading(true)
    setError('')
    try {
      if (missingEnv) {
        setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then restart the dev server.')
        return
      }
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) setError(error.message)
      else toast({ title: 'Confirmation email resent', description: 'Check your inbox to confirm your account.' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend confirmation email'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestMode = () => {
    enterGuestMode()
    toast({
      title: "Entering Guest Mode",
      description: "You can explore the app with limited features.",
    })
  navigate(redirectPath)
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
            {missingEnv && (
              <Alert variant="destructive">
                <AlertDescription>
                  Supabase environment variables are missing. Set either:
                  - VITE_SUPABASE_URL or VITE_SUPABASE_PROJECT_ID
                  - VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY
                  Then restart the dev server to enable sign in/up.
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {info && (
              <Alert>
                <AlertDescription>{info}</AlertDescription>
              </Alert>
            )}

            {/* Dev debug panel removed per request */}

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
                  <div className="flex">
                    <Button type="button" variant="ghost" className="w-full" onClick={handlePasswordReset} disabled={isLoading}>
                      Forgot Password?
                    </Button>
                  </div>
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
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !email || password.length < 6 || password !== confirmPassword}
                  >
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