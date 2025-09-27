import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSessionContext } from '../contexts/SessionContext';

const { width } = Dimensions.get('window');

const CoursesScreen = () => {
  const navigation = useNavigation();
  const { session, isGuest } = useSessionContext();
  const [track, setTrack] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [tag, setTag] = useState<string | 'All'>('All');

  // Complete course data matching web
  const courses = [
    {
      id: 'fundamentals',
      title: 'Sustainable Farming Fundamentals',
      description: 'Master the core principles of sustainable agriculture, soil health management, and crop rotation techniques.',
      track: 'Beginner',
      tags: ['Soil Health', 'Crop Rotation', 'Organic'],
      difficulty: 'Beginner',
      duration: '6 weeks',
      rating: 4.8,
      progress: session ? 75 : 0,
      completed: session ? false : false,
      coverImage: null,
      lessons: 12,
      students: 1250,
      instructor: 'Dr. Sarah Johnson'
    },
    {
      id: 'nasa-data',
      title: 'NASA Satellite Data for Agriculture',
      description: 'Learn to analyze MODIS NDVI, SMAP soil moisture, and GPM precipitation data for precision farming decisions.',
      track: 'Advanced',
      tags: ['NASA Data', 'Remote Sensing', 'Precision Agriculture'],
      difficulty: 'Advanced',
      duration: '8 weeks',
      rating: 4.9,
      progress: session ? 45 : 0,
      completed: session ? false : false,
      coverImage: null,
      lessons: 16,
      students: 890,
      instructor: 'Prof. Michael Chen'
    },
    {
      id: 'climate-resilience',
      title: 'Climate Resilient Farming',
      description: 'Adapt your farming practices to climate change using data-driven strategies and resilient crop varieties.',
      track: 'Intermediate',
      tags: ['Climate Change', 'Adaptation', 'Resilience'],
      difficulty: 'Intermediate',
      duration: '7 weeks',
      rating: 4.7,
      progress: session ? 30 : 0,
      completed: session ? false : false,
      coverImage: null,
      lessons: 14,
      students: 720,
      instructor: 'Dr. Emma Rodriguez'
    },
    {
      id: 'precision-irrigation',
      title: 'Smart Irrigation Systems',
      description: 'Design and implement precision irrigation systems using soil sensors, weather data, and automation.',
      track: 'Advanced',
      tags: ['Irrigation', 'Smart Technology', 'Water Management'],
      difficulty: 'Advanced',
      duration: '6 weeks',
      rating: 4.8,
      progress: session ? 60 : 0,
      completed: session ? false : false,
      coverImage: null,
      lessons: 10,
      students: 650,
      instructor: 'Dr. James Wilson'
    },
    {
      id: 'organic-certification',
      title: 'Organic Farming Certification',
      description: 'Complete guide to organic farming practices and certification requirements for sustainable agriculture.',
      track: 'Beginner',
      tags: ['Organic', 'Certification', 'Standards'],
      difficulty: 'Beginner',
      duration: '5 weeks',
      rating: 4.6,
      progress: session ? 90 : 0,
      completed: session ? true : false,
      coverImage: null,
      lessons: 8,
      students: 1100,
      instructor: 'Lisa Thompson'
    },
    {
      id: 'crop-monitoring',
      title: 'Crop Health Monitoring',
      description: 'Use drones, satellite imagery, and ground sensors to monitor crop health and detect diseases early.',
      track: 'Intermediate',
      tags: ['Monitoring', 'Disease Detection', 'Technology'],
      difficulty: 'Intermediate',
      duration: '6 weeks',
      rating: 4.7,
      progress: session ? 15 : 0,
      completed: session ? false : false,
      coverImage: null,
      lessons: 11,
      students: 580,
      instructor: 'Dr. Alex Kumar'
    }
  ];

  // Statistics matching web
  const totalCourses = courses.length;
  const completedCourses = courses.filter(c => c.completed).length;
  const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100).length;
  const avgRating = (courses.reduce((sum, c) => sum + c.rating, 0) / totalCourses).toFixed(1);

  // Filters matching web
  const tracks = Array.from(new Set(courses.map(c => c.track))).sort();
  const tags = Array.from(new Set(courses.flatMap(c => c.tags))).sort();
  const filtered = courses.filter(c => 
    (track === 'All' || c.track === track) && 
    (tag === 'All' || c.tags.includes(tag as string))
  );

  const handleCoursePress = (course: typeof courses[0]) => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to access courses.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Auth' as never) }
        ]
      );
      return;
    }
    Alert.alert('Course Access', `Starting "${course.title}" course with ${course.lessons} lessons.`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header - Matching Web */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>🎓 Agricultural Courses</Text>
            <Text style={styles.subtitle}>Master sustainable farming with expert-led courses and earn certificates</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressRing}>
              <Text style={styles.progressPercent}>{Math.round((completedCourses / totalCourses) * 100)}%</Text>
            </View>
            <Text style={styles.progressLabel}>Course Progress</Text>
          </View>
        </View>
      </View>

      {/* Enhanced Stats Grid - Matching Web */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statValue}>{totalCourses}</Text>
            <Text style={styles.statTitle}>Total Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{completedCourses}</Text>
            <Text style={styles.statTitle}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statValue}>{inProgressCourses}</Text>
            <Text style={styles.statTitle}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{avgRating}</Text>
            <Text style={styles.statTitle}>Avg Rating</Text>
          </View>
        </View>
      </View>

      {/* Filters - Matching Web */}
      <View style={styles.filtersSection}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Track:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {(['All', ...tracks] as Array<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>).map(t => (
              <TouchableOpacity 
                key={t} 
                style={[styles.filterButton, track === t && styles.activeFilterButton]} 
                onPress={() => setTrack(t)}
              >
                <Text style={[styles.filterButtonText, track === t && styles.activeFilterButtonText]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Tag:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {(['All', ...tags]).map(t => (
              <TouchableOpacity 
                key={t} 
                style={[styles.filterButton, tag === t && styles.activeFilterButton]} 
                onPress={() => setTag(t)}
              >
                <Text style={[styles.filterButtonText, tag === t && styles.activeFilterButtonText]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Course Cards - Matching Web Enhanced Design */}
      <View style={styles.coursesSection}>
        {filtered.map((course, index) => (
          <TouchableOpacity 
            key={course.id} 
            style={[
              styles.courseCard,
              { 
                borderLeftColor: course.track === 'Beginner' ? '#10B981' : 
                                course.track === 'Intermediate' ? '#F59E0B' : '#EF4444'
              }
            ]} 
            onPress={() => handleCoursePress(course)}
          >
            {/* Course Header */}
            <View style={styles.courseHeader}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseInstructor}>by {course.instructor}</Text>
              </View>
              <View style={styles.courseRating}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>{course.rating}</Text>
              </View>
            </View>

            {/* Course Description */}
            <Text style={styles.courseDescription}>{course.description}</Text>

            {/* Course Meta */}
            <View style={styles.courseMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📋</Text>
                <Text style={styles.metaText}>{course.lessons} lessons</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⏱️</Text>
                <Text style={styles.metaText}>{course.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>👥</Text>
                <Text style={styles.metaText}>{course.students} students</Text>
              </View>
            </View>

            {/* Course Tags */}
            <View style={styles.courseTags}>
              {course.tags.map((tag, tagIndex) => (
                <View key={tagIndex} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Progress Bar */}
            {session && course.progress > 0 && (
              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${course.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{course.progress}% complete</Text>
              </View>
            )}

            {/* Course Status */}
            <View style={styles.courseStatus}>
              {course.completed ? (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✅ Completed</Text>
                </View>
              ) : course.progress > 0 ? (
                <View style={styles.inProgressBadge}>
                  <Text style={styles.inProgressText}>📚 In Progress</Text>
                </View>
              ) : (
                <View style={styles.notStartedBadge}>
                  <Text style={styles.notStartedText}>▶️ Start Course</Text>
                </View>
              )}
              
              <Text style={[
                styles.difficultyBadge,
                { 
                  backgroundColor: course.track === 'Beginner' ? '#F0FDF4' : 
                                  course.track === 'Intermediate' ? '#FFFBEB' : '#FEF2F2',
                  color: course.track === 'Beginner' ? '#166534' : 
                         course.track === 'Intermediate' ? '#92400E' : '#991B1B'
                }
              ]}>
                {course.difficulty}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

      <View style={styles.coursesContainer}>
        {courses.map((course) => (
          <TouchableOpacity 
            key={course.id} 
            style={styles.courseCard}
            onPress={() => handleCoursePress(course)}
          >
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseDescription}>{course.description}</Text>
            <Text style={styles.difficulty}>📊 {course.difficulty}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#2563EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#dbeafe',
  },
  coursesContainer: {
    padding: 20,
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  difficulty: {
    fontSize: 14,
    color: '#374151',
  },
  // New styles matching web design
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f9f4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#10B981',
    marginBottom: 5,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressLabel: {
    fontSize: 10,
    color: '#dbeafe',
  },
  statsSection: {
    padding: 20,
    paddingTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: (width - 60) / 2,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  filtersSection: {
    padding: 20,
    paddingTop: 0,
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  activeFilterButton: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  coursesSection: {
    padding: 20,
    paddingTop: 0,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  courseInfo: {
    flex: 1,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  courseRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  courseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  courseStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  inProgressBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inProgressText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  notStartedBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  notStartedText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CoursesScreen;
