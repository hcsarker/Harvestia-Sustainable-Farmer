import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Award,
  Download,
  Share2,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Trophy,
  Star,
  Medal,
} from "lucide-react"
import { useCertificates } from '@/hooks/useCertificates'
import { useAchievements } from '@/hooks/useAchievements'
import { useUserProgress } from '@/hooks/useUserProgress'
import { useNavigate } from 'react-router-dom'

export default function Certificates() {
  const navigate = useNavigate()
  const { earned, inProgress, available, loading } = useCertificates()
  const { loading: achLoading, all: allAchievements, earnedIds, userAch, certCount } = useAchievements()
  const { courseProgress } = useUserProgress()

  const earnedAtById = new Map<string, string>()
  userAch?.forEach((ua) => earnedAtById.set(ua.achievement_id, ua.earned_at))

  const earnedAchievements = allAchievements.filter((a) => earnedIds.has(a.id))
  const notEarnedAchievements = allAchievements.filter((a) => !earnedIds.has(a.id))

  const getAchievementProgress = (id: string) => {
    if (id === 'perfect_score') {
      const top = Math.max(0, ...courseProgress.map((cp) => cp.progress || 0))
      const pct = Math.min(100, Math.round(top))
      return { percent: pct, label: `${pct}%` }
    }
    if (id === 'knowledge_collector') {
      const target = 5
      const count = certCount || 0
      const pct = Math.min(100, Math.round((count / target) * 100))
      return { percent: pct, fraction: `${count} / ${target}` }
    }
    return { percent: undefined as number | undefined }
  }

  // Map DB-provided icon or derive a sensible fallback by achievement id
  const computeAchievementIcon = (id: string, provided?: string | null) => {
    const trimmed = (provided || '').trim()
    // Translate common icon names (case-insensitive) to emojis
    const lucideToEmojiLower: Record<string, string> = {
      satellite: '🛰️',
      award: '🏆',
      leaf: '♻️',
      trophy: '🏆',
      graduationcap: '🎓',
      sprout: '🌱',
      brain: '🧠',
      bookopen: '📖',
      medal: '🏅',
      star: '⭐',
      rocket: '🚀',
    }
    if (trimmed) {
      let key = trimmed.toLowerCase().replace(/[^a-z]/g, '') // keep only letters
      if (key.endsWith('icon')) key = key.slice(0, -4)
      if (lucideToEmojiLower[key]) return lucideToEmojiLower[key]
      // If user provided an emoji already, keep it
      if (/\p{Extended_Pictographic}/u.test(trimmed)) return trimmed
    }
    // Pattern-based fallbacks
    if (id.startsWith('story_ch')) return '📖'
    const map: Record<string, string> = {
      story_master: '🏆',
      first_steps: '🌱',
      quiz_master: '🧠',
      quiz_champion: '🏆',
      sustainable_learner: '♻️',
      eco_warrior: '♻️',
      data_analyst: '🛰️',
      data_explorer: '🛰️',
      game_champion: '🏆',
      game_master: '🏆',
      expert_farmer: '🧑‍🌾',
      first_certificate: '🏆',
      quick_learner: '⚡',
      perfect_score: '⭐',
      knowledge_collector: '📚',
      course_graduate: '🎓',
      welcome_farmer: '🌱',
    }
    return map[id] || '🏅'
  }

  const avgScore = earned.length
    ? Math.round(earned.reduce((sum, cert) => sum + (cert.score || 0), 0) / earned.length)
    : 0
  const totalHours = earned.reduce((sum, cert) => sum + (cert.hoursCompleted || 0), 0)

  return (
    <div className="container py-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Award className="h-8 w-8 mr-3 text-primary animate-float" />
              Certificates & Achievements
            </h1>
            <p className="text-muted-foreground mt-2">
              Your learning accomplishments and professional certifications
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{earned.length}</div>
            <div className="text-sm text-muted-foreground">Certificates Earned</div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{loading ? '-' : earned.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold text-accent">{loading ? '-' : inProgress.length}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <Star className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <div className="text-2xl font-bold text-secondary">{loading ? '-' : `${avgScore}%`}</div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <Medal className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{loading ? '-' : totalHours}</div>
            <div className="text-sm text-muted-foreground">Hours Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Certificates */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-primary" />
            Earned Certificates ({earned.length})
          </h2>
          <div className="grid gap-6">
            {earned.map((cert) => (
              <Card key={cert.id} className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 hover:shadow-xl transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-3xl animate-bounce-subtle">{cert.icon || '🎓'}</span>
                        <div>
                          <CardTitle className="text-xl text-primary">{cert.title}</CardTitle>
                          <CardDescription className="text-base">{cert.description}</CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'Recently earned'}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {cert.instructor}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {(cert.hoursCompleted || 0)} hours
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2 bg-primary text-primary-foreground">
                        Grade: {cert.grade || 'A'}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Score: <span className="font-bold text-primary">{cert.score ?? 100}%</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Skills Mastered</h4>
                      <div className="flex flex-wrap gap-2">
                        {(cert.skills || ['Sustainable Practices']).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-muted-foreground">
                        Credential ID: <span className="font-mono">{cert.credentialId || 'pending'}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => cert.download?.()} disabled={!cert.download}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* In Progress */}
        {inProgress.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-accent" />
              In Progress ({inProgress.length})
            </h2>
            <div className="grid gap-6">
              {inProgress.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-3xl">{cert.icon || '🎓'}</span>
                          <div>
                            <CardTitle className="text-xl">{cert.title}</CardTitle>
                            <CardDescription>{cert.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {(cert.hoursCompleted || 0)} / {(cert.totalHours || 0)} hours
                          </span>
                        </div>
                        <Progress value={cert.score || 0} className="w-full" />
                        <div className="text-center text-sm text-muted-foreground mt-1">
                          {(cert.score || 0)}% complete
                        </div>
                      </div>

                      <Button className="w-full" onClick={() => navigate(`/courses/${cert.courseId}`)}>
                        Continue Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Available Certificates */}
        {available.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Star className="h-6 w-6 mr-2 text-secondary" />
              Available Certificates ({available.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {available.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-3xl opacity-50">{cert.icon || '🎓'}</span>
                      <div>
                        <CardTitle className="text-lg">{cert.title}</CardTitle>
                        <CardDescription className="text-sm">{cert.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Estimated time: {(cert.totalHours || 0)} hours
                      </div>
                      <Button className="w-full" variant="secondary" onClick={() => navigate(`/courses/${cert.courseId}`)}>
                        Start Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-primary" />
              Achievements
            </h2>
            {!achLoading && (
              <Badge variant="secondary">{Array.from(earnedIds).length}/{allAchievements.length}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">Unlock badges by completing courses and games</p>

          {achLoading ? (
            <div className="text-sm text-muted-foreground">Loading achievements…</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {(() => {
                // Fixed order for primary badges, then others
                const order = [
                  'first_steps',
                  'quiz_master',
                  'sustainable_learner',
                  'data_analyst',
                  'game_champion',
                  'expert_farmer',
                ]
                const idx = (id: string) => {
                  const i = order.indexOf(id)
                  return i === -1 ? order.length + id.charCodeAt(0) : i
                }
                const sorted = [...allAchievements].sort((a, b) => idx(a.id) - idx(b.id))
                return sorted.map((achievement) => {
                  const icon = computeAchievementIcon(achievement.id, achievement.icon)
                  const isEarned = earnedIds.has(achievement.id)
                  return (
                    <Card
                      key={achievement.id}
                      className={
                        isEarned
                          ? 'border-green-200 bg-green-50'
                          : 'border-muted-foreground/10 bg-muted/40'
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <span className="text-3xl" aria-hidden>{icon}</span>
                              <div>
                                <div className="font-semibold">{achievement.name}</div>
                                <div className="text-sm text-muted-foreground">{achievement.description}</div>
                              </div>
                            </div>
                          </div>
                          {isEarned && (
                            <Badge className="bg-amber-100 text-amber-800 border border-amber-200">Earned</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              })()}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}