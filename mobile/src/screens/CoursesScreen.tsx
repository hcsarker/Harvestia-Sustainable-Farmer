import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSessionContext } from '../contexts/SessionContext';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
  certificate: boolean;
  lessons: number;
  progress?: number;
  tags: string[];
}

const COURSES: Course[] = [
  {
    id: 'sustainable-farming',
    title: 'Sustainable Farming Fundamentals',
    description: 'Learn the basics of sustainable agriculture, soil health, and crop rotation techniques for long-term productivity.',
    instructor: 'Dr. Sarah Johnson',
    duration: '6 weeks',
    difficulty: 'Beginner',
    rating: 4.8,
    students: 2340,
    certificate: true,
    lessons: 24,
    tags: ['Sustainability', 'Soil Health'],
  },
  {
    id: 'precision-agriculture',
    title: 'Precision Agriculture with Technology',
    description: 'Master modern farming techniques using GPS, sensors, and data analytics for optimized crop yields.',
    instructor: 'Prof. Michael Chen',
    duration: '8 weeks',
    difficulty: 'Advanced',
    rating: 4.9,
    students: 1850,
    certificate: true,
    lessons: 32,
    tags: ['Technology', 'Data Analytics'],
  },
  {
    id: 'organic-farming',
    title: 'Organic Farming Methods',
    description: 'Comprehensive guide to organic farming practices, natural pest control, and certification processes.',
    instructor: 'Maria Rodriguez',
    duration: '5 weeks',
    difficulty: 'Intermediate',
    rating: 4.7,
    students: 1920,
    certificate: true,
    lessons: 20,
    tags: ['Organic', 'Certification'],
  },
  {
    id: 'climate-smart-agriculture',
    title: 'Climate-Smart Agriculture',
    description: 'Adapt farming practices to climate change, improve resilience, and reduce environmental impact.',
    instructor: 'Dr. James Wilson',
    duration: '7 weeks',
    difficulty: 'Intermediate',
    rating: 4.8,
    students: 2100,
    certificate: true,
    lessons: 28,
    tags: ['Climate Change', 'Resilience'],
  },
  {
    id: 'water-management',
    title: 'Efficient Water Management',
    description: 'Optimize irrigation systems, conserve water resources, and implement smart watering strategies.',
    instructor: 'Dr. Lisa Park',
    duration: '4 weeks',
    difficulty: 'Beginner',
    rating: 4.6,
    students: 1750,
    certificate: true,
    lessons: 16,
    tags: ['Water Conservation', 'Irrigation'],
  },
];

export default function CoursesScreen() {
  const navigation = useNavigation();
  const { session, isGuest } = useSessionContext();
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  useEffect(() => {
    // Add progress for authenticated users
    if (!isGuest) {
      const coursesWithProgress = COURSES.map(course => ({
        ...course,
        progress: Math.floor(Math.random() * 100),
      }));
      setCourses(coursesWithProgress);
    } else {
      setCourses(COURSES);
    }
  }, [isGuest]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.difficulty.toLowerCase() === filter;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleCoursePress = (course: Course) => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Create a free account to access full course content and track your progress.',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Sign Up', onPress: () => navigation.navigate('Auth' as never) },
        ]
      );
    } else {
      Alert.alert('Course Access', `Opening "${course.title}"\n\nProgress: ${course.progress || 0}%`);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎓 Learning Courses</Text>
        <Text style={styles.subtitle}>
          Master sustainable farming with expert-led courses
        </Text>
      </View>

      {/* Guest Notice */}
      {isGuest && (
        <TouchableOpacity 
          style={styles.guestNotice}
          onPress={() => navigation.navigate('Auth' as never)}
        >
          <Text style={styles.guestNoticeIcon}>🌟</Text>
          <View style={styles.guestNoticeContent}>
            <Text style={styles.guestNoticeTitle}>Unlock Full Learning Experience</Text>
            <Text style={styles.guestNoticeText}>
              Sign up to track progress, earn certificates, and access premium content
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterButton,
              filter === level && styles.filterButtonActive
            ]}
            onPress={() => setFilter(level as 'all' | 'beginner' | 'intermediate' | 'advanced')}
          >
            <Text style={[
              styles.filterText,
              filter === level && styles.filterTextActive
            ]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Course Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredCourses.length}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredCourses.reduce((sum, c) => sum + c.lessons, 0)}</Text>
          <Text style={styles.statLabel}>Lessons</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{isGuest ? 0 : Math.floor(Math.random() * 5) + 1}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Courses List */}
      <View style={styles.coursesContainer}>
        {filteredCourses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseCard}
            onPress={() => handleCoursePress(course)}
            activeOpacity={0.8}
          >
            {/* Course Header */}
            <View style={styles.courseHeader}>
              <View style={styles.courseHeaderTop}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(course.difficulty) }]}>
                  <Text style={styles.difficultyText}>{course.difficulty}</Text>
                </View>
                {course.certificate && (
                  <Text style={styles.certificateIcon}>🏆</Text>
                )}
              </View>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseInstructor}>by {course.instructor}</Text>
            </View>

            {/* Course Description */}
            <Text style={styles.courseDescription} numberOfLines={2}>
              {course.description}
            </Text>

            {/* Course Info */}
            <View style={styles.courseInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>⏱️</Text>
                <Text style={styles.infoText}>{course.duration}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>⭐</Text>
                <Text style={styles.infoText}>{course.rating}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>👥</Text>
                <Text style={styles.infoText}>{course.students.toLocaleString()}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📚</Text>
                <Text style={styles.infoText}>{course.lessons} lessons</Text>
              </View>
            </View>

            {/* Progress Bar (for authenticated users) */}
            {!isGuest && course.progress !== undefined && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Progress: {course.progress}%</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${course.progress}%` }
                    ]} 
                  />
                </View>
              </View>
            )}

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {course.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer Call to Action */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Ready to start learning?</Text>
        <Text style={styles.footerText}>
          Join thousands of farmers improving their skills with our expert courses
        </Text>
        {isGuest ? (
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Auth' as never)}
          >
            <Text style={styles.ctaButtonText}>Get Started Free</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => Alert.alert('Premium', 'Premium features coming soon!')}
          >
            <Text style={styles.ctaButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  guestNotice: {
    backgroundColor: '#fef3c7',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestNoticeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  guestNoticeContent: {
    flex: 1,
  },
  guestNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  guestNoticeText: {
    fontSize: 14,
    color: '#a16207',
  },
  filterContainer: {
    paddingVertical: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  coursesContainer: {
    paddingHorizontal: 16,
  },
  courseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  courseHeader: {
    marginBottom: 12,
  },
  courseHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  certificateIcon: {
    fontSize: 20,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#64748b',
  },
  courseDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  courseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});