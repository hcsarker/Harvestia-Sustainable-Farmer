import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SessionContextProvider } from './src/contexts/SessionContext';
import { Text, View, StyleSheet } from 'react-native';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import GamesScreen from './src/screens/GamesScreen';
import AuthScreen from './src/screens/AuthScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SimulationScreen from './src/screens/SimulationScreen';
import CertificatesScreen from './src/screens/CertificatesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigation (like web sidebar)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={IndexScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
          tabBarLabel: 'Dashboard'
        }}
      />
      <Tab.Screen 
        name="Story" 
        component={StoryJourneyScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📖</Text>,
          tabBarLabel: 'Farm Story'
        }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📚</Text>,
          tabBarLabel: 'Courses'
        }}
      />
      <Tab.Screen 
        name="Simulation" 
        component={AgriculturalSimulationScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🌱</Text>,
          tabBarLabel: 'Simulation'
        }}
      />
      <Tab.Screen 
        name="Games" 
        component={MiniGamesScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎮</Text>,
          tabBarLabel: 'Games'
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator for deep navigation
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#1f2937',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      {/* Main Tab Stack */}
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs}
        options={{ headerShown: false }}
      />
      
      {/* Course Detail */}
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen}
        options={{ title: 'Course Details' }}
      />
      
      {/* Chapter Content */}
      <Stack.Screen 
        name="ChapterContent" 
        component={ChapterContentScreen}
        options={{ title: 'Chapter' }}
      />
      
      {/* Quiz Exam */}
      <Stack.Screen 
        name="QuizExam" 
        component={QuizExamScreen}
        options={{ title: 'Quiz' }}
      />
      
      {/* Quizzes */}
      <Stack.Screen 
        name="Quizzes" 
        component={QuizzesScreen}
        options={{ title: 'Quizzes' }}
      />
      
      {/* Facts */}
      <Stack.Screen 
        name="Facts" 
        component={FactsScreen}
        options={{ title: 'Facts' }}
      />
      
      {/* Profile */}
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      
      {/* Certificates */}
      <Stack.Screen 
        name="Certificates" 
        component={CertificatesScreen}
        options={{ title: 'Certificates' }}
      />
      
      {/* My Results */}
      <Stack.Screen 
        name="MyResults" 
        component={MyResultsScreen}
        options={{ title: 'My Results' }}
      />
      
      {/* Auth */}
      <Stack.Screen 
        name="Auth" 
        component={AuthScreen}
        options={{ title: 'Sign In' }}
      />
      
      {/* Settings */}
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SessionContextProvider>
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>
    </SessionContextProvider>
  );
}