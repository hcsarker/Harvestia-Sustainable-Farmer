import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { SessionContextProvider, useSessionContext } from './src/contexts/SessionContext';

// Import all screens (matching web pages)
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import GamesScreen from './src/screens/GamesScreen';
import AuthScreen from './src/screens/AuthScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SimulationScreen from './src/screens/SimulationScreen';
import CertificatesScreen from './src/screens/CertificatesScreen';
import StoryJourneyScreen from './src/screens/StoryJourneyScreen';
import ChapterContentScreen from './src/screens/ChapterContentScreen';
import FactsScreen from './src/screens/FactsScreen';
import QuizzesScreen from './src/screens/QuizzesScreen';
import QuizExamScreen from './src/screens/QuizExamScreen';
import MyResultsScreen from './src/screens/MyResultsScreen';
import AboutScreen from './src/screens/AboutScreen';
import ContactScreen from './src/screens/ContactScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import VerifyCertificateScreen from './src/screens/VerifyCertificateScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main Tab Navigation (matching web sidebar)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🏠' : '🏡'}</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '📚' : '📖'}</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Games" 
        component={GamesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🎮' : '🕹️'}</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Story" 
        component={StoryJourneyScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🗺️' : '🗾'}</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '👤' : '👥'}</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator for deep navigation (matching web routes)
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      
      {/* Course related screens */}
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      
      {/* Story related screens */}
      <Stack.Screen name="ChapterContent" component={ChapterContentScreen} />
      
      {/* Quiz related screens */}
      <Stack.Screen name="Quizzes" component={QuizzesScreen} />
      <Stack.Screen name="QuizExam" component={QuizExamScreen} />
      <Stack.Screen name="MyResults" component={MyResultsScreen} />
      
      {/* Learning content screens */}
      <Stack.Screen name="Facts" component={FactsScreen} />
      <Stack.Screen name="Simulation" component={SimulationScreen} />
      
      {/* User account screens */}
      <Stack.Screen name="Certificates" component={CertificatesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      
      {/* Information screens */}
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="VerifyCertificate" component={VerifyCertificateScreen} />
    </Stack.Navigator>
  );
}

// Main App Content (matching web AppContent structure)
function AppContent() {
  const { session, loading } = useSessionContext();

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f8f9fa' 
      }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>🌱</Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#10B981' }}>
          Harvestia
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 5 }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!session ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  );
}

// Main App Component (matching web App structure)
export default function App() {
  return (
    <SessionContextProvider>
      <AppContent />
    </SessionContextProvider>
  );
}