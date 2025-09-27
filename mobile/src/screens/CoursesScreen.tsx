import React, { useEffect, useState } from 'react';import React, { useEffect, useState } from 'react';

import {import {

  View,  View,

  Text,  Text,

  StyleSheet,  StyleSheet,

  ScrollView,  Scrolconst CoursesScreen: React.FC = () => {

  TouchableOpacity,  const navigation = useNavigation();

  RefreshControl,  const { session, isGuest } = useSessionContext();

  Alert,  

} from 'react-native';  // Use real hooks from web for actual data

import { useNavigation } from '@react-navigation/native';  const { courses: webCourses, loading: coursesLoading } = useCoursesCatalog();

import { useSessionContext } from '../contexts/SessionContext';  const { courseProgress } = useUserProgress();

  

interface Course {  const [courses, setCourses] = useState<Course[]>(COURSES);

  id: string;  const [refreshing, setRefreshing] = useState(false);

  title: string;  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  description: string;

  instructor: string;  useEffect(() => {

  duration: string;    // Use web courses if available, fallback to static data

  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';    if (webCourses && webCourses.length > 0) {

  rating: number;      const coursesWithProgress = webCourses.map(course => ({

  students: number;        ...course,

  certificate: boolean;        progress: courseProgress?.[course.id] || 0,

  lessons: number;      }));

  progress?: number;      setCourses(coursesWithProgress);

  tags: string[];    } else if (!isGuest) {

}      const coursesWithProgress = COURSES.map(course => ({

        ...course,

const COURSES: Course[] = [        progress: Math.floor(Math.random() * 100),

  {      }));

    id: 'sustainable-farming',      setCourses(coursesWithProgress);

    title: 'Sustainable Farming Fundamentals',    } else {

    description: 'Learn the basics of sustainable agriculture, soil health, and crop rotation techniques.',      setCourses(COURSES);

    instructor: 'Dr. Sarah Johnson',    }

    duration: '6 weeks',  }, [isGuest, webCourses, courseProgress]);pacity,

    difficulty: 'Beginner',  RefreshControl,

    rating: 4.8,  Alert,

    students: 2340,} from 'react-native';

    certificate: true,import { useNavigation } from '@react-navigation/native';

    lessons: 24,import { useSessionContext } from '../contexts/SessionContext';

    tags: ['Sustainability', 'Soil Health'],import { useCoursesCatalog } from '../hooks/useCoursesCatalog';

  },import { useUserProgress } from '../hooks/useUserProgress';

  {

    id: 'precision-agriculture',interface Course {

    title: 'Precision Agriculture with Technology',  id: string;

    description: 'Master modern farming techniques using GPS, sensors, and data analytics.',  title: string;

    instructor: 'Prof. Michael Chen',  description: string;

    duration: '8 weeks',  instructor: string;

    difficulty: 'Advanced',  duration: string;

    rating: 4.9,  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';

    students: 1850,  rating: number;

    certificate: true,  students: number;

    lessons: 32,  certificate: boolean;

    tags: ['Technology', 'Data Analytics'],  lessons: number;

  },  progress?: number;

  {  tags: string[];

    id: 'organic-farming',}

    title: 'Organic Farming Methods',

    description: 'Comprehensive guide to organic farming practices and natural pest control.',const COURSES: Course[] = [

    instructor: 'Maria Rodriguez',  {

    duration: '5 weeks',    id: 'sustainable-farming',

    difficulty: 'Intermediate',    title: 'Sustainable Farming Fundamentals',

    rating: 4.7,    description: 'Learn the basics of sustainable agriculture, soil health, and crop rotation techniques for long-term productivity.',

    students: 1920,    instructor: 'Dr. Sarah Johnson',

    certificate: true,    duration: '6 weeks',

    lessons: 20,    difficulty: 'Beginner',

    tags: ['Organic', 'Certification'],    rating: 4.8,

  },    students: 2340,

];    certificate: true,

    lessons: 24,

const CoursesScreen: React.FC = () => {    tags: ['Sustainability', 'Soil Health'],

  const navigation = useNavigation();  },

  const { session, isGuest } = useSessionContext();  {

  const [courses, setCourses] = useState<Course[]>(COURSES);    id: 'precision-agriculture',

  const [refreshing, setRefreshing] = useState(false);    title: 'Precision Agriculture with Technology',

  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');    description: 'Master modern farming techniques using GPS, sensors, and data analytics for optimized crop yields.',

    instructor: 'Prof. Michael Chen',

  useEffect(() => {    duration: '8 weeks',

    // Add progress for authenticated users    difficulty: 'Advanced',

    if (!isGuest) {    rating: 4.9,

      const coursesWithProgress = COURSES.map(course => ({    students: 1850,

        ...course,    certificate: true,

        progress: Math.floor(Math.random() * 100),    lessons: 32,

      }));    tags: ['Technology', 'Data Analytics'],

      setCourses(coursesWithProgress);  },

    } else {  {

      setCourses(COURSES);    id: 'organic-farming',

    }    title: 'Organic Farming Methods',

  }, [isGuest]);    description: 'Comprehensive guide to organic farming practices, natural pest control, and certification processes.',

    instructor: 'Maria Rodriguez',

  const onRefresh = async () => {    duration: '5 weeks',

    setRefreshing(true);    difficulty: 'Intermediate',

    setTimeout(() => setRefreshing(false), 1000);    rating: 4.7,

  };    students: 1920,

    certificate: true,

  const filteredCourses = courses.filter(course => {    lessons: 20,

    if (filter === 'all') return true;    tags: ['Organic', 'Certification'],

    return course.difficulty.toLowerCase() === filter;  },

  });  {

    id: 'climate-smart-agriculture',

  const handleCoursePress = (course: Course) => {    title: 'Climate-Smart Agriculture',

    if (isGuest) {    description: 'Adapt farming practices to climate change, improve resilience, and reduce environmental impact.',

      Alert.alert(    instructor: 'Dr. James Wilson',

        'Sign In Required',    duration: '7 weeks',

        'Please sign in to access courses and track your progress.',    difficulty: 'Intermediate',

        [    rating: 4.8,

          { text: 'Cancel', style: 'cancel' },    students: 2100,

          { text: 'Sign In', onPress: () => navigation.navigate('Auth' as never) },    certificate: true,

        ]    lessons: 28,

      );    tags: ['Climate Change', 'Resilience'],

      return;  },

    }  {

        id: 'water-management',

    Alert.alert('Course Access', `Opening "${course.title}"\n\nProgress: ${course.progress || 0}%`);    title: 'Efficient Water Management',

  };    description: 'Optimize irrigation systems, conserve water resources, and implement smart watering strategies.',

    instructor: 'Dr. Lisa Park',

  return (    duration: '4 weeks',

    <ScrollView     difficulty: 'Beginner',

      style={styles.container}    rating: 4.6,

      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}    students: 1750,

    >    certificate: true,

      <View style={styles.header}>    lessons: 16,

        <Text style={styles.title}>🎓 Learning Courses</Text>    tags: ['Water Conservation', 'Irrigation'],

        <Text style={styles.subtitle}>Master sustainable farming techniques</Text>  },

        ];

        {isGuest && (

          <TouchableOpacity export default function CoursesScreen() {

            style={styles.signInPrompt}   const navigation = useNavigation();

            onPress={() => navigation.navigate('Auth' as never)}  const { session, isGuest } = useSessionContext();

          >  const [courses, setCourses] = useState<Course[]>(COURSES);

            <Text style={styles.signInPromptText}>🔐 Sign in to track progress</Text>  const [refreshing, setRefreshing] = useState(false);

          </TouchableOpacity>  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

        )}

      </View>  useEffect(() => {

    // Add progress for authenticated users

      <ScrollView     if (!isGuest) {

        horizontal       const coursesWithProgress = COURSES.map(course => ({

        showsHorizontalScrollIndicator={false}        ...course,

        contentContainerStyle={styles.filterContainer}        progress: Math.floor(Math.random() * 100),

      >      }));

        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((filterOption) => (      setCourses(coursesWithProgress);

          <TouchableOpacity    } else {

            key={filterOption}      setCourses(COURSES);

            style={[styles.filterTab, filter === filterOption && styles.activeFilterTab]}    }

            onPress={() => setFilter(filterOption)}  }, [isGuest]);

          >

            <Text style={[styles.filterText, filter === filterOption && styles.activeFilterText]}>  const onRefresh = async () => {

              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}    setRefreshing(true);

            </Text>    // Simulate API refresh

          </TouchableOpacity>    await new Promise(resolve => setTimeout(resolve, 1000));

        ))}    setRefreshing(false);

      </ScrollView>  };



      <View style={styles.coursesContainer}>  const filteredCourses = courses.filter(course => {

        {filteredCourses.map((course, index) => (    if (filter === 'all') return true;

          <TouchableOpacity key={course.id} style={styles.courseCard} onPress={() => handleCoursePress(course)}>    return course.difficulty.toLowerCase() === filter;

            <View style={styles.courseHeader}>  });

              <Text style={styles.courseTitle}>{course.title}</Text>

              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(course.difficulty) }]}>  const getDifficultyColor = (difficulty: string) => {

                <Text style={styles.difficultyText}>{course.difficulty}</Text>    switch (difficulty) {

              </View>      case 'Beginner': return '#10B981';

            </View>      case 'Intermediate': return '#F59E0B';

                  case 'Advanced': return '#EF4444';

            <Text style={styles.courseDescription}>{course.description}</Text>      default: return '#6B7280';

                }

            <View style={styles.courseMetrics}>  };

              <Text style={styles.instructor}>👨‍🏫 {course.instructor}</Text>

              <Text style={styles.duration}>⏱️ {course.duration}</Text>  const handleCoursePress = (course: Course) => {

            </View>    if (isGuest) {

                  Alert.alert(

            <View style={styles.courseStats}>        'Sign In Required',

              <Text style={styles.rating}>⭐ {course.rating}</Text>        'Create a free account to access full course content and track your progress.',

              <Text style={styles.students}>👥 {course.students}</Text>        [

              <Text style={styles.lessons}>📚 {course.lessons} lessons</Text>          { text: 'Maybe Later', style: 'cancel' },

              {course.certificate && <Text style={styles.certificate}>🏆 Certificate</Text>}          { text: 'Sign Up', onPress: () => navigation.navigate('Auth' as never) },

            </View>        ]

                  );

            {course.progress !== undefined && (    } else {

              <View style={styles.progressContainer}>      Alert.alert('Course Access', `Opening "${course.title}"\n\nProgress: ${course.progress || 0}%`);

                <Text style={styles.progressText}>Progress: {course.progress}%</Text>    }

                <View style={styles.progressBar}>  };

                  <View style={[styles.progressFill, { width: `${course.progress}%` }]} />

                </View>  return (

              </View>    <ScrollView 

            )}      style={styles.container}

                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}

            <View style={styles.tagsContainer}>    >

              {course.tags.map((tag, tagIndex) => (      {/* Header */}

                <View key={tagIndex} style={styles.tag}>      <View style={styles.header}>

                  <Text style={styles.tagText}>{tag}</Text>        <Text style={styles.title}>🎓 Learning Courses</Text>

                </View>        <Text style={styles.subtitle}>

              ))}          Master sustainable farming with expert-led courses

            </View>        </Text>

          </TouchableOpacity>      </View>

        ))}

      </View>      {/* Guest Notice */}

    </ScrollView>      {isGuest && (

  );        <TouchableOpacity 

};          style={styles.guestNotice}

          onPress={() => navigation.navigate('Auth' as never)}

const getDifficultyColor = (difficulty: string) => {        >

  switch (difficulty) {          <Text style={styles.guestNoticeIcon}>🌟</Text>

    case 'Beginner': return '#10B981';          <View style={styles.guestNoticeContent}>

    case 'Intermediate': return '#F59E0B';            <Text style={styles.guestNoticeTitle}>Unlock Full Learning Experience</Text>

    case 'Advanced': return '#EF4444';            <Text style={styles.guestNoticeText}>

    default: return '#6B7280';              Sign up to track progress, earn certificates, and access premium content

  }            </Text>

};          </View>

        </TouchableOpacity>

const styles = StyleSheet.create({      )}

  container: {

    flex: 1,      {/* Filter Buttons */}

    backgroundColor: '#f8f9fa',      <ScrollView 

  },        horizontal 

  header: {        showsHorizontalScrollIndicator={false}

    padding: 20,        style={styles.filterContainer}

    paddingTop: 60,        contentContainerStyle={styles.filterContent}

    backgroundColor: '#2563EB',      >

  },        {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (

  title: {          <TouchableOpacity

    fontSize: 24,            key={level}

    fontWeight: 'bold',            style={[

    color: 'white',              styles.filterButton,

    marginBottom: 8,              filter === level && styles.filterButtonActive

  },            ]}

  subtitle: {            onPress={() => setFilter(level as 'all' | 'beginner' | 'intermediate' | 'advanced')}

    fontSize: 16,          >

    color: '#dbeafe',            <Text style={[

  },              styles.filterText,

  signInPrompt: {              filter === level && styles.filterTextActive

    backgroundColor: 'rgba(255, 255, 255, 0.1)',            ]}>

    padding: 12,              {level.charAt(0).toUpperCase() + level.slice(1)}

    borderRadius: 8,            </Text>

    marginTop: 16,          </TouchableOpacity>

  },        ))}

  signInPromptText: {      </ScrollView>

    color: 'white',

    fontSize: 14,      {/* Course Stats */}

    fontWeight: '500',      <View style={styles.statsRow}>

    textAlign: 'center',        <View style={styles.statBox}>

  },          <Text style={styles.statNumber}>{filteredCourses.length}</Text>

  filterContainer: {          <Text style={styles.statLabel}>Courses</Text>

    paddingHorizontal: 20,        </View>

    paddingVertical: 15,        <View style={styles.statBox}>

  },          <Text style={styles.statNumber}>{filteredCourses.reduce((sum, c) => sum + c.lessons, 0)}</Text>

  filterTab: {          <Text style={styles.statLabel}>Lessons</Text>

    paddingHorizontal: 16,        </View>

    paddingVertical: 8,        <View style={styles.statBox}>

    marginRight: 10,          <Text style={styles.statNumber}>{isGuest ? 0 : Math.floor(Math.random() * 5) + 1}</Text>

    borderRadius: 20,          <Text style={styles.statLabel}>Completed</Text>

    backgroundColor: '#e5e7eb',        </View>

  },      </View>

  activeFilterTab: {

    backgroundColor: '#2563EB',      {/* Courses List */}

  },      <View style={styles.coursesContainer}>

  filterText: {        {filteredCourses.map((course) => (

    fontSize: 14,          <TouchableOpacity

    fontWeight: '500',            key={course.id}

    color: '#374151',            style={styles.courseCard}

  },            onPress={() => handleCoursePress(course)}

  activeFilterText: {            activeOpacity={0.8}

    color: 'white',          >

  },            {/* Course Header */}

  coursesContainer: {            <View style={styles.courseHeader}>

    padding: 20,              <View style={styles.courseHeaderTop}>

  },                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(course.difficulty) }]}>

  courseCard: {                  <Text style={styles.difficultyText}>{course.difficulty}</Text>

    backgroundColor: 'white',                </View>

    borderRadius: 12,                {course.certificate && (

    padding: 16,                  <Text style={styles.certificateIcon}>🏆</Text>

    marginBottom: 16,                )}

    shadowColor: '#000',              </View>

    shadowOffset: { width: 0, height: 2 },              <Text style={styles.courseTitle}>{course.title}</Text>

    shadowOpacity: 0.1,              <Text style={styles.courseInstructor}>by {course.instructor}</Text>

    shadowRadius: 4,            </View>

    elevation: 3,

  },            {/* Course Description */}

  courseHeader: {            <Text style={styles.courseDescription} numberOfLines={2}>

    flexDirection: 'row',              {course.description}

    justifyContent: 'space-between',            </Text>

    alignItems: 'flex-start',

    marginBottom: 8,            {/* Course Info */}

  },            <View style={styles.courseInfo}>

  courseTitle: {              <View style={styles.infoItem}>

    fontSize: 18,                <Text style={styles.infoIcon}>⏱️</Text>

    fontWeight: 'bold',                <Text style={styles.infoText}>{course.duration}</Text>

    color: '#111827',              </View>

    flex: 1,              <View style={styles.infoItem}>

    marginRight: 10,                <Text style={styles.infoIcon}>⭐</Text>

  },                <Text style={styles.infoText}>{course.rating}</Text>

  difficultyBadge: {              </View>

    paddingHorizontal: 8,              <View style={styles.infoItem}>

    paddingVertical: 4,                <Text style={styles.infoIcon}>👥</Text>

    borderRadius: 12,                <Text style={styles.infoText}>{course.students.toLocaleString()}</Text>

  },              </View>

  difficultyText: {              <View style={styles.infoItem}>

    color: 'white',                <Text style={styles.infoIcon}>📚</Text>

    fontSize: 12,                <Text style={styles.infoText}>{course.lessons} lessons</Text>

    fontWeight: 'bold',              </View>

  },            </View>

  courseDescription: {

    fontSize: 14,            {/* Progress Bar (for authenticated users) */}

    color: '#6B7280',            {!isGuest && course.progress !== undefined && (

    lineHeight: 20,              <View style={styles.progressContainer}>

    marginBottom: 12,                <Text style={styles.progressText}>Progress: {course.progress}%</Text>

  },                <View style={styles.progressBar}>

  courseMetrics: {                  <View 

    marginBottom: 12,                    style={[

  },                      styles.progressFill, 

  instructor: {                      { width: `${course.progress}%` }

    fontSize: 14,                    ]} 

    color: '#374151',                  />

    marginBottom: 4,                </View>

  },              </View>

  duration: {            )}

    fontSize: 14,

    color: '#374151',            {/* Tags */}

  },            <View style={styles.tagsContainer}>

  courseStats: {              {course.tags.map((tag, index) => (

    flexDirection: 'row',                <View key={index} style={styles.tag}>

    justifyContent: 'space-between',                  <Text style={styles.tagText}>{tag}</Text>

    marginBottom: 12,                </View>

  },              ))}

  rating: {            </View>

    fontSize: 12,          </TouchableOpacity>

    color: '#F59E0B',        ))}

    fontWeight: '500',      </View>

  },

  students: {      {/* Footer Call to Action */}

    fontSize: 12,      <View style={styles.footer}>

    color: '#6B7280',        <Text style={styles.footerTitle}>Ready to start learning?</Text>

  },        <Text style={styles.footerText}>

  lessons: {          Join thousands of farmers improving their skills with our expert courses

    fontSize: 12,        </Text>

    color: '#6B7280',        {isGuest ? (

  },          <TouchableOpacity 

  certificate: {            style={styles.ctaButton}

    fontSize: 12,            onPress={() => navigation.navigate('Auth' as never)}

    color: '#10B981',          >

    fontWeight: 'bold',            <Text style={styles.ctaButtonText}>Get Started Free</Text>

  },          </TouchableOpacity>

  progressContainer: {        ) : (

    marginBottom: 12,          <TouchableOpacity 

  },            style={styles.ctaButton}

  progressText: {            onPress={() => Alert.alert('Premium', 'Premium features coming soon!')}

    fontSize: 12,          >

    color: '#374151',            <Text style={styles.ctaButtonText}>Upgrade to Premium</Text>

    marginBottom: 4,          </TouchableOpacity>

  },        )}

  progressBar: {      </View>

    height: 4,    </ScrollView>

    backgroundColor: '#E5E7EB',  );

    borderRadius: 2,}

    overflow: 'hidden',

  },const styles = StyleSheet.create({

  progressFill: {  container: {

    height: '100%',    flex: 1,

    backgroundColor: '#10B981',    backgroundColor: '#f8fafc',

  },  },

  tagsContainer: {  header: {

    flexDirection: 'row',    padding: 20,

    flexWrap: 'wrap',    paddingTop: 60,

  },    backgroundColor: '#ffffff',

  tag: {    borderBottomWidth: 1,

    backgroundColor: '#F3F4F6',    borderBottomColor: '#e2e8f0',

    paddingHorizontal: 8,  },

    paddingVertical: 4,  title: {

    borderRadius: 8,    fontSize: 28,

    marginRight: 8,    fontWeight: '700',

    marginBottom: 4,    color: '#1e293b',

  },    marginBottom: 4,

  tagText: {  },

    fontSize: 12,  subtitle: {

    color: '#374151',    fontSize: 16,

  },    color: '#64748b',

});  },

  guestNotice: {

export default CoursesScreen;    backgroundColor: '#fef3c7',
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