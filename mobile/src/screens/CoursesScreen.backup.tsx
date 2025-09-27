import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  progress: number;
}

const CoursesScreen: React.FC = () => {
  const { session } = useSessionContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const sampleCourses: Course[] = [
    {
      id: 'course1',
      title: 'Sustainable Farming Basics',
      description: 'Learn the fundamentals of sustainable agriculture practices',
      duration: '2 weeks',
      difficulty: 'Beginner',
      completed: false,
      progress: 30,
    },
    {
      id: 'course2',
      title: 'Organic Soil Management',
      description: 'Master organic soil preparation and health management',
      duration: '3 weeks',
      difficulty: 'Intermediate',
      completed: true,
      progress: 100,
    },
    {
      id: 'course3',
      title: 'Water Conservation Techniques',
      description: 'Advanced water management and conservation methods',
      duration: '4 weeks',
      difficulty: 'Advanced',
      completed: false,
      progress: 0,
    },
    {
      id: 'course4',
      title: 'Integrated Pest Management',
      description: 'Natural and effective pest control strategies',
      duration: '2 weeks',
      difficulty: 'Intermediate',
      completed: false,
      progress: 60,
    },
    {
      id: 'course5',
      title: 'Climate-Smart Agriculture',
      description: 'Adapt farming practices to climate change',
      duration: '5 weeks',
      difficulty: 'Advanced',
      completed: false,
      progress: 15,
    },
  ];

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        
        if (session) {
          console.log('Loading courses for user:', session.user.id);
          // Future: Load from database
        }

        // For now, use sample data
        setCourses(sampleCourses);
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses(sampleCourses);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [session]);

  const getDifficultyColor = (difficulty: Course['difficulty']) => {
    switch (difficulty) {
      case 'Beginner':
        return '#10B981';
      case 'Intermediate':
        return '#F59E0B';
      case 'Advanced':
        return '#EF4444';
    }
  };

  const handleCoursePress = (course: Course) => {
    console.log('Course pressed:', course.title);
    // Future: Navigate to course content
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  const completedCourses = courses.filter(course => course.completed).length;
  const totalCourses = courses.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎓 Learning Center</Text>
        <Text style={styles.subtitle}>Master sustainable farming techniques</Text>
        
        {!session && (
          <View style={styles.guestNotice}>
            <Text style={styles.guestNoticeText}>
              📚 Browse courses freely! Sign in to track progress and earn certificates.
            </Text>
          </View>
        )}
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedCourses}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCourses - completedCourses}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCourses}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      <View style={styles.coursesContainer}>
        <Text style={styles.sectionTitle}>Available Courses</Text>
        
        {courses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={[
              styles.courseCard,
              course.completed && styles.completedCourseCard,
            ]}
            onPress={() => handleCoursePress(course)}
          >
            <View style={styles.courseHeader}>
              <View style={styles.courseTitleContainer}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(course.difficulty) }
                ]}>
                  <Text style={styles.difficultyText}>{course.difficulty}</Text>
                </View>
              </View>
              
              {course.completed && (
                <Text style={styles.completedIcon}>✅</Text>
              )}
            </View>

            <Text style={styles.courseDescription}>{course.description}</Text>
            
            <View style={styles.courseFooter}>
              <Text style={styles.courseDuration}>⏱ {course.duration}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${course.progress}%`,
                        backgroundColor: course.completed ? '#10B981' : '#3B82F6'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{course.progress}%</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.continueButton}>
              <Text style={styles.continueButtonText}>
                {course.completed ? 'Review Course' : 
                 course.progress > 0 ? 'Continue Learning' : 'Start Course'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Complete courses to unlock achievements and earn certificates! 🏆
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#DBEAFE',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#DBEAFE',
    marginTop: 4,
  },
  coursesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  completedCourseCard: {
    borderLeftColor: '#10B981',
    backgroundColor: '#f0f9f4',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  completedIcon: {
    fontSize: 20,
  },
  courseDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  courseDuration: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  guestNotice: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  guestNoticeText: {
    color: '#1d4ed8',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CoursesScreen;