import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Award, 
  BookOpen, 
  Gamepad2, 
  MapPin,
  Star,
  Calendar,
  Trophy,
  Target,
  Edit
} from "lucide-react"

const userStats = {
  name: "Alex Johnson",
  email: "alex@example.com",
  joinDate: "March 2024",
  location: "Iowa, USA",
  farmType: "Corn & Soybean",
  coursesCompleted: 3,
  coursesInProgress: 2,
  certificatesEarned: 2,
  gamesPlayed: 28,
  totalScore: 45250,
  level: 12,
  experiencePoints: 2340,
  nextLevelXP: 2500
}

const achievements = [
  { name: "First Steps", description: "Complete your first course", earned: true, icon: "🌱" },
  { name: "Quiz Master", description: "Score 100% on 5 quizzes", earned: true, icon: "🧠" },
  { name: "Sustainable Learner", description: "Complete sustainability course", earned: true, icon: "♻️" },
  { name: "Data Analyst", description: "Master NASA data interpretation", earned: false, icon: "🛰️" },
  { name: "Game Champion", description: "Reach top 10 in any mini-game", earned: false, icon: "🏆" },
  { name: "Expert Farmer", description: "Complete all advanced courses", earned: false, icon: "👨‍🌾" }
]

const recentActivity = [
  { type: "course", action: "Completed lesson 3 in 'NASA Data for Smart Agriculture'", time: "2 hours ago" },
  { type: "game", action: "Achieved high score in 'Crop Rotation Master'", time: "1 day ago" },
  { type: "certificate", action: "Earned certificate in 'Sustainable Farming Fundamentals'", time: "3 days ago" },
  { type: "quiz", action: "Scored 95% on 'Soil Health Basics' quiz", time: "5 days ago" }
]

export default function Profile() {
  const levelProgress = (userStats.experiencePoints / userStats.nextLevelXP) * 100

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
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-2xl">
                  {userStats.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{userStats.name}</CardTitle>
              <CardDescription>{userStats.email}</CardDescription>
              <div className="flex items-center justify-center text-sm text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                {userStats.location}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Farm Type</span>
                <Badge variant="secondary">{userStats.farmType}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Member Since</span>
                <span>{userStats.joinDate}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Level {userStats.level}</span>
                  <span>{userStats.experiencePoints} / {userStats.nextLevelXP} XP</span>
                </div>
                <Progress value={levelProgress} className="w-full" />
              </div>
              <Button className="w-full" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
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
                  <span className="font-semibold">{userStats.coursesCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="font-semibold">{userStats.coursesInProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Certificates</span>
                  <span className="font-semibold flex items-center">
                    <Award className="h-4 w-4 mr-1 text-primary" />
                    {userStats.certificatesEarned}
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
                  <span className="font-semibold">{userStats.gamesPlayed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Score</span>
                  <span className="font-semibold font-mono">{userStats.totalScore.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Level</span>
                  <span className="font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1 text-primary fill-current" />
                    {userStats.level}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Achievements
              </CardTitle>
              <CardDescription>
                Unlock badges by completing courses and games
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center p-3 rounded-lg border ${
                    achievement.earned ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-muted'
                  }`}>
                    <span className="text-2xl mr-3 grayscale-0">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className={`font-medium ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {achievement.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.earned && (
                      <Badge variant="secondary" className="ml-2">
                        Earned
                      </Badge>
                    )}
                  </div>
                ))}
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