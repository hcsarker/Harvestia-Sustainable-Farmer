import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Shield, Eye, Database } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-top-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">How we collect, use, and protect your data</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="animate-in fade-in slide-in-from-left-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-emerald-500" /><CardTitle>What we collect</CardTitle></div>
            <CardDescription>Only what’s needed for core features</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Account info (email, id) for authentication</p>
            <p>• Quiz results and progress to personalize learning</p>
            <p>• Basic preferences (theme, settings)</p>
          </CardContent>
        </Card>
        <Card className="animate-in fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Eye className="h-5 w-5 text-emerald-500" /><CardTitle>How we use it</CardTitle></div>
            <CardDescription>Improve your experience — nothing else</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Power app features and save progress</p>
            <p>• Optional, aggregated analytics to improve usability</p>
            <p>• We do not sell your data</p>
          </CardContent>
        </Card>
        <Card className="animate-in fade-in slide-in-from-right-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2"><Database className="h-5 w-5 text-emerald-500" /><CardTitle>Your control</CardTitle></div>
            <CardDescription>You're in charge of your data</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Request account deletion anytime</p>
            <p>• Export your data upon request</p>
            <p>• Opt out of non-essential analytics</p>
          </CardContent>
        </Card>
      </div>
      <p className="mt-6 text-xs text-muted-foreground text-center animate-in fade-in">
        For questions, contact us via the Contact page.
      </p>
    </div>
  )
}
