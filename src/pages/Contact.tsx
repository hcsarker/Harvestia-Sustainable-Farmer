import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, User } from 'lucide-react'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // For now, just simulate a send and show a simple confirmation
    setSent(true)
  }

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-top-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">We'd love to hear your thoughts and ideas</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <Card className="animate-in fade-in slide-in-from-left-2">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>We typically reply within 2–3 business days</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-sm text-muted-foreground">Thanks! Your message has been received.</div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input className="pl-9" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="relative">
                  <MessageSquare className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Textarea className="pl-9" placeholder="Your message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
                </div>
                <Button type="submit" className="w-full">Send</Button>
              </form>
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden animate-in fade-in slide-in-from-right-2">
          <CardContent className="p-0">
            <img src="/Team logo.jpg" alt="Harvestia" className="w-full h-[260px] md:h-full object-cover" loading="lazy" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
