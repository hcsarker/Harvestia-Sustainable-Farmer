import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [canReset, setCanReset] = useState(false)
  const { toast } = useToast()

  // Determine if user reached this page via a valid recovery link (access_token in URL)
  useEffect(() => {
    const checkSession = async () => {
      // Supabase will set a recovery session if user lands from the email link
      const { data: { session } } = await supabase.auth.getSession()
      setCanReset(!!session)
    }
    checkSession()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Minimum 6 characters', variant: 'destructive' })
      return
    }
    if (password !== confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' })
      return
    }
    if (!canReset) {
      toast({ title: 'Reset not authorized', description: 'Open the link from your email to reset your password.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast({ title: 'Failed to update password', description: error.message, variant: 'destructive' })
        return
      }
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {canReset ? 'Enter and confirm your new password.' : 'To reset your password, request a reset email and open the link from your inbox.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" disabled={!canReset || loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••" disabled={!canReset || loading} />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !canReset}>{loading ? 'Updating…' : 'Update Password'}</Button>
          </form>
          {!canReset && (
            <div className="text-sm text-muted-foreground mt-4">
              Tip: Go to the Sign In page, enter your email, and click “Forgot Password?” to receive a reset link.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
