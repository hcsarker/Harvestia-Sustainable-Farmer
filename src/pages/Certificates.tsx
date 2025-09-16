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
  Medal
} from "lucide-react"

const certificates = [
  {
    id: 1,
    title: "Sustainable Farming Fundamentals",
    description: "Mastery of core sustainable agriculture principles and practices",
    issueDate: "March 15, 2024",
    instructor: "Dr. Maria Rodriguez",
    grade: "A+",
    score: 96,
    credentialId: "HARV-SF-2024-001",
    status: "earned",
    skills: ["Soil Management", "Crop Rotation", "Water Conservation", "Pest Control"],
    hoursCompleted: 40,
    icon: "🌱"
  },
  {
    id: 2,
    title: "NASA Data for Smart Agriculture",
    description: "Advanced satellite data analysis for precision farming decisions",
    issueDate: "April 2, 2024", 
    instructor: "Prof. James Chen",
    grade: "A",
    score: 92,
    credentialId: "HARV-NASA-2024-002",
    status: "earned",
    skills: ["Remote Sensing", "Data Analysis", "MODIS Interpretation", "Yield Prediction"],
    hoursCompleted: 60,
    icon: "🛰️"
  },
  {
    id: 3,
    title: "Climate-Resilient Crop Management",
    description: "Adapting farming practices to changing climate conditions",
    issueDate: null,
    instructor: "Dr. Sarah Williams",
    grade: null,
    score: 0,
    credentialId: null,
    status: "in-progress",
    progress: 67,
    skills: ["Climate Adaptation", "Drought Management", "Variety Selection", "Risk Assessment"],
    hoursCompleted: 35,
    totalHours: 50,
    icon: "🌡️"
  },
  {
    id: 4,
    title: "Organic Certification Mastery",
    description: "Complete guide to organic farming certification and compliance",
    issueDate: null,
    instructor: "Prof. Lisa Anderson",
    grade: null,
    score: 0,
    credentialId: null,
    status: "available",
    skills: ["Organic Standards", "Certification Process", "Record Keeping", "Compliance"],
    totalHours: 30,
    icon: "🌿"
  }
]

const achievements = [
  {
    name: "First Certificate",
    description: "Earned your first certificate",
    icon: "🏆",
    earned: true,
    date: "March 15, 2024"
  },
  {
    name: "Perfect Score",
    description: "Achieved 100% in any course",
    icon: "⭐",
    earned: false,
    progress: 96
  },
  {
    name: "Quick Learner",
    description: "Complete a course in under 30 days",
    icon: "⚡",
    earned: true,
    date: "March 15, 2024"
  },
  {
    name: "Knowledge Collector",
    description: "Earn 5 certificates",
    icon: "📚",
    earned: false,
    progress: 2,
    total: 5
  }
]

export default function Certificates() {
  const earnedCertificates = certificates.filter(cert => cert.status === 'earned')
  const inProgressCertificates = certificates.filter(cert => cert.status === 'in-progress')
  const availableCertificates = certificates.filter(cert => cert.status === 'available')

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
            <div className="text-3xl font-bold text-primary">{earnedCertificates.length}</div>
            <div className="text-sm text-muted-foreground">Certificates Earned</div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{earnedCertificates.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold text-accent">{inProgressCertificates.length}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <Star className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <div className="text-2xl font-bold text-secondary">
              {earnedCertificates.reduce((sum, cert) => sum + cert.score, 0) / earnedCertificates.length || 0}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <Medal className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {earnedCertificates.reduce((sum, cert) => sum + cert.hoursCompleted, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Hours Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Certificates */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-primary" />
            Earned Certificates ({earnedCertificates.length})
          </h2>
          <div className="grid gap-6">
            {earnedCertificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 hover:shadow-xl transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-3xl animate-bounce-subtle">{cert.icon}</span>
                        <div>
                          <CardTitle className="text-xl text-primary">{cert.title}</CardTitle>
                          <CardDescription className="text-base">{cert.description}</CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {cert.issueDate}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {cert.instructor}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {cert.hoursCompleted} hours
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2 bg-primary text-primary-foreground">
                        Grade: {cert.grade}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Score: <span className="font-bold text-primary">{cert.score}%</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Skills Mastered</h4>
                      <div className="flex flex-wrap gap-2">
                        {cert.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-muted-foreground">
                        Credential ID: <span className="font-mono">{cert.credentialId}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
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
        {inProgressCertificates.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-accent" />
              In Progress ({inProgressCertificates.length})
            </h2>
            <div className="grid gap-6">
              {inProgressCertificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-3xl">{cert.icon}</span>
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
                            {cert.hoursCompleted} / {cert.totalHours} hours
                          </span>
                        </div>
                        <Progress value={cert.progress} className="w-full" />
                        <div className="text-center text-sm text-muted-foreground mt-1">
                          {cert.progress}% complete
                        </div>
                      </div>
                      
                      <Button className="w-full">
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
        {availableCertificates.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Star className="h-6 w-6 mr-2 text-secondary" />
              Available Certificates ({availableCertificates.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {availableCertificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-3xl opacity-50">{cert.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{cert.title}</CardTitle>
                        <CardDescription className="text-sm">{cert.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Estimated time: {cert.totalHours} hours
                      </div>
                      <Button className="w-full" variant="secondary">
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
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-primary" />
            Learning Achievements
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index} className={`hover:shadow-lg transition-all duration-300 ${
                achievement.earned ? 'border-primary/20 bg-primary/5' : 'opacity-75'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <span className={`text-3xl ${achievement.earned ? 'animate-bounce-subtle' : 'grayscale'}`}>
                      {achievement.icon}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-medium ${achievement.earned ? 'text-primary' : 'text-muted-foreground'}`}>
                        {achievement.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-primary mt-1">Earned on {achievement.date}</p>
                      )}
                      {!achievement.earned && achievement.progress && (
                        <div className="mt-2">
                          <Progress value={(achievement.progress / (achievement.total || 100)) * 100} className="w-full" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.progress}{achievement.total ? ` / ${achievement.total}` : '%'}
                          </p>
                        </div>
                      )}
                    </div>
                    {achievement.earned && (
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        Earned
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}