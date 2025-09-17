import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Award, BookOpen, Gamepad2, MapPin, Star, Calendar, Trophy, Target, Edit, Upload, MapPinOff, KeyRound } from "lucide-react"
import React from 'react'
import { useAuth } from "@/hooks/useAuth"
import { useUserProgress } from "@/hooks/useUserProgress"
import { useAchievements } from "@/hooks/useAchievements"
import { Input } from "@/components/ui/input"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function Profile() {
  const { user, profile, fetchUserProfile, isGuest } = useAuth()
  const { courseProgress, gameScores, loading: progressLoading } = useUserProgress()
  const { all: allAchievements, earnedIds, certCount, loading: achLoading, refresh } = useAchievements()
  const [editMode, setEditMode] = React.useState(false)
  const [displayName, setDisplayName] = React.useState(profile?.display_name ?? '')
  const [location, setLocation] = React.useState(profile?.location ?? '')
  const [farmType, setFarmType] = React.useState(profile?.farm_type ?? '')
  const [saving, setSaving] = React.useState(false)
  const [avatarUploading, setAvatarUploading] = React.useState(false)
  const [locLoading, setLocLoading] = React.useState(false)
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [pwdLoading, setPwdLoading] = React.useState(false)
  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    setDisplayName(profile?.display_name ?? '')
    setLocation(profile?.location ?? '')
    setFarmType(profile?.farm_type ?? '')
  }, [profile])

  const coursesCompleted = courseProgress.filter(c => c.completed).length
  const coursesInProgress = courseProgress.filter(c => !c.completed && (c.progress ?? 0) > 0).length
  const gamesPlayed = gameScores.reduce((acc, g) => acc + (g.times_played ?? 0), 0)
  const totalScore = gameScores.reduce((acc, g) => acc + (g.high_score ?? 0), 0)
  const level = profile?.level ?? 1
  const experiencePoints = profile?.experience_points ?? 0
  const nextLevelXP = Math.max(100, level * 200)
  const levelProgress = Math.min(100, (experiencePoints / nextLevelXP) * 100)
  const earnedCount = earnedIds.size

  const onSaveProfile = async () => {
    if (!user || isGuest) return
    setSaving(true)
    try {
      await supabase.from('profiles').upsert({
        user_id: user.id,
        display_name: displayName || null,
        location: location || null,
        farm_type: farmType || null,
      }, { onConflict: 'user_id' })
      await fetchUserProfile(user.id)
      setEditMode(false)
      toast({ title: 'Profile updated' })
    } finally {
      setSaving(false)
    }
  }

  const onChangeAvatarClick = () => {
    if (isGuest) return
    fileInputRef.current?.click()
  }

  const onAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || isGuest) return
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type || undefined })
      if (upErr) {
        toast({ title: 'Upload failed', description: upErr.message, variant: 'destructive' })
        return
      }
  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = pub.publicUrl
      // Persist in DB and refresh profile
  const { error: saveErr } = await supabase.from('profiles').upsert({ user_id: user.id, avatar_url: avatarUrl }, { onConflict: 'user_id' });
      if (saveErr) {
        toast({ title: 'Profile update failed', description: saveErr.message, variant: 'destructive' })
        return
      }
      await fetchUserProfile(user.id)
      toast({ title: 'Avatar updated' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error'
      toast({ title: 'Upload error', description: msg, variant: 'destructive' })
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const onUseCurrentLocation = async () => {
    if (isGuest) return
    setLocLoading(true)
    try {
      const tryIpApi = async (): Promise<string | null> => {
        try {
          const res = await fetch('https://ipapi.co/json/')
          if (!res.ok) return null
          const data = await res.json() as { city?: string; region?: string; country_name?: string }
          const city = data.city || ''
          const region = data.region || ''
          const country = data.country_name || ''
          const locStr = [city, region, country].filter(Boolean).join(', ')
          return locStr || null
        } catch { return null }
      }

  const getGeoReverse = async (): Promise<string | null> => new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null)
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const { latitude, longitude } = pos.coords
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
            if (!res.ok) return resolve(null)
            const data = await res.json() as { address?: { city?: string; town?: string; village?: string; state?: string; country?: string } }
            const a = data.address || {}
            const city = a.city || a.town || a.village || ''
            const region = a.state || ''
            const country = a.country || ''
            const locStr = [city, region, country].filter(Boolean).join(', ')
            resolve(locStr || null)
          } catch { resolve(null) }
        }, () => resolve(null), { enableHighAccuracy: false, timeout: 5000 })
      })

  const resolved = await getGeoReverse() || await tryIpApi()
      if (resolved) {
        setLocation(resolved)
        // Save to DB automatically and refresh profile
        if (user) {
          const { error: locErr } = await supabase.from('profiles').upsert({ user_id: user.id, location: resolved }, { onConflict: 'user_id' })
          if (locErr) {
            toast({ title: 'Location save failed', description: locErr.message, variant: 'destructive' })
          } else {
            await fetchUserProfile(user.id)
            toast({ title: 'Location updated', description: resolved })
          }
        }
      } else {
        toast({ title: 'Could not detect location', description: 'You can enter it manually.', variant: 'destructive' })
      }
    } finally {
      setLocLoading(false)
    }
  }

  // Auto-detect and save location if empty on first load (authenticated users only)
  React.useEffect(() => {
    if (!isGuest && user && !profile?.location && !locLoading) {
      onUseCurrentLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile?.location])

  const onChangePassword = async () => {
    if (!user || isGuest) return
    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'Password too short', description: 'Minimum 6 characters', variant: 'destructive' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' })
      return
    }
    setPwdLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        toast({ title: 'Password change failed', description: error.message, variant: 'destructive' })
        return
      }
      toast({ title: 'Password updated' })
      setNewPassword("")
      setConfirmPassword("")
    } finally {
      setPwdLoading(false)
    }
  }

const recentActivity = [
  { type: "course", action: "Completed lesson 3 in 'NASA Data for Smart Agriculture'", time: "2 hours ago" },
  { type: "game", action: "Achieved high score in 'Crop Rotation Master'", time: "1 day ago" },
  { type: "certificate", action: "Earned certificate in 'Sustainable Farming Fundamentals'", time: "3 days ago" },
  { type: "quiz", action: "Scored 95% on 'Soil Health Basics' quiz", time: "5 days ago" }
]

  if (!user && !isGuest) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        Please sign in to view your profile.
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Track your learning progress and achievements
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="mx-auto h-20 w-20 mb-4">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-2xl">
                  {(displayName || profile?.display_name || (user?.email ?? 'U')).split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {!isGuest && (
                <div className="flex justify-center mb-2">
                  <input ref={fileInputRef} className="hidden" type="file" accept="image/*" onChange={onAvatarFileSelected} />
                  <Button variant="outline" size="sm" onClick={onChangeAvatarClick} disabled={avatarUploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {avatarUploading ? 'Uploading...' : 'Change Photo'}
                  </Button>
                </div>
              )}
              <CardTitle>{displayName || profile?.display_name || 'Anonymous'}</CardTitle>
              <CardDescription>{user?.email ?? 'guest'}</CardDescription>
              <div className="flex items-center justify-center text-sm text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                {location || profile?.location || 'Unknown'}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Display Name</span>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Location</span>
                    <div className="flex gap-2">
                      <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                      <Button type="button" variant="outline" onClick={onUseCurrentLocation} disabled={locLoading} title="Detect location">
                        {locLoading ? '...' : <MapPinOff className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Farm Type</span>
                    <Input value={farmType} onChange={(e) => setFarmType(e.target.value)} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Farm Type</span>
                    <Badge variant="secondary">{farmType || profile?.farm_type || 'N/A'}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Member Since</span>
                    <span>{profile?.join_date ? new Date(profile.join_date).toLocaleDateString() : '—'}</span>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Level {level}</span>
                  <span>{experiencePoints} / {nextLevelXP} XP</span>
                </div>
                <Progress value={levelProgress} className="w-full" />
              </div>
              {editMode ? (
                <div className="flex gap-2">
                  <Button className="w-full" variant="secondary" onClick={() => setEditMode(false)} disabled={saving}>Cancel</Button>
                  <Button className="w-full" onClick={onSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                </div>
              ) : (
                <Button className="w-full" variant="outline" onClick={() => setEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Security settings */}
          {!isGuest && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <KeyRound className="h-5 w-5 mr-2" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">New Password</span>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Confirm Password</span>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={onChangePassword} disabled={pwdLoading}>
                    {pwdLoading ? 'Updating…' : 'Update Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Courses Completed</span>
                  <span className="font-semibold">{coursesCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="font-semibold">{coursesInProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Certificates</span>
                  <span className="font-semibold flex items-center">
                    <Award className="h-4 w-4 mr-1 text-primary" />
                    {certCount}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Gamepad2 className="h-5 w-5 mr-2" />
                  Gaming Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Games Played</span>
                  <span className="font-semibold">{gamesPlayed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Score</span>
                  <span className="font-semibold font-mono">{totalScore.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Level</span>
                  <span className="font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1 text-primary fill-current" />
                    {level}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Achievements
                </CardTitle>
                <Badge variant="secondary" className="ml-2">{earnedCount}/{allAchievements.length}</Badge>
              </div>
              <CardDescription>
                Unlock badges by completing courses and games
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {allAchievements.map((achievement) => {
                  const earned = earnedIds.has(achievement.id)
                  const DEFAULT_ICON = '🏅'
                  const fallbackIcons: Record<string, string> = {
                    first_steps: '🌱',
                    quiz_master: '🧠',
                    sustainable_learner: '🌿',
                    data_analyst: '🛰️',
                    game_champion: '🏆',
                    expert_farmer: '🧑‍🌾',
                  }
                  const icon = (achievement.icon && achievement.icon.trim()) || fallbackIcons[achievement.id] || DEFAULT_ICON
                  return (
                  <div key={achievement.id} className={`flex items-center p-3 rounded-lg border ${
                    earned ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-muted'
                  }`}>
                    <span className={`text-2xl mr-3 ${earned ? 'motion-safe:animate-bounce' : 'opacity-60'} transition-transform duration-200 hover:scale-110`} aria-hidden>
                      {icon}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-medium ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {achievement.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                    {earned && (
                      <Badge variant="secondary" className="ml-2">
                        Earned
                      </Badge>
                    )}
                  </div>)
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start p-3 rounded-lg bg-muted/30">
                    <div className={`p-1 rounded-full mr-3 mt-1 ${
                      activity.type === 'course' ? 'bg-blue-500' :
                      activity.type === 'game' ? 'bg-green-500' :
                      activity.type === 'certificate' ? 'bg-purple-500' : 'bg-orange-500'
                    }`}>
                      {activity.type === 'course' && <BookOpen className="h-3 w-3 text-white" />}
                      {activity.type === 'game' && <Gamepad2 className="h-3 w-3 text-white" />}
                      {activity.type === 'certificate' && <Award className="h-3 w-3 text-white" />}
                      {activity.type === 'quiz' && <Target className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}