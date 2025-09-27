import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SessionContextProvider, useSessionContext } from './src/contexts/SessionContext';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import GamesScreen from './src/screens/GamesScreen';
import AuthScreen from './src/screens/AuthScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SimulationScreen from './src/screens/SimulationScreen';
import CertificatesScreen from './src/screens/CertificatesScreen';
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>{title}</Text>
      <Text style={{ marginTop: 8 }}>Coming soon...</Text>
    </View>
  );
}

function StoryScreen() {
  const { session } = useSessionContext();
  
  const storyChapters = [
    {
      id: 1,
      title: 'The Beginning',
      description: 'Starting your sustainable farming journey',
      completed: true,
      locked: false,
      duration: '10 min read',
    },
    {
      id: 2,
      title: 'Understanding Soil',
      description: 'Learning about soil health and composition',
      completed: true,
      locked: false,
      duration: '15 min read',
    },
    {
      id: 3,
      title: 'Climate & Weather',
      description: 'Using weather data for farming decisions',
      completed: false,
      locked: false,
      duration: '20 min read',
    },
    {
      id: 4,
      title: 'Advanced Techniques',
      description: 'Modern sustainable farming methods',
      completed: false,
      locked: !session,
      duration: '25 min read',
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={{ backgroundColor: '#8B5CF6', padding: 24, paddingTop: 60 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
          📖 Farming Journey
        </Text>
        <Text style={{ fontSize: 16, color: '#e9d5ff' }}>
          {session ? 'Continue your sustainable farming story' : 'Learn sustainable farming through stories'}
        </Text>
        
        {!session && (
          <View style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            padding: 12, 
            borderRadius: 8, 
            marginTop: 16, 
            borderWidth: 1, 
            borderColor: 'rgba(255, 255, 255, 0.2)' 
          }}>
            <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', fontWeight: '500' }}>
              📚 Read freely! Sign in to unlock advanced chapters and track progress
            </Text>
          </View>
        )}
      </View>

      <View style={{ padding: 20 }}>
        <View style={{
          backgroundColor: 'white',
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
            📈 Story Progress
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Chapters Completed</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#8B5CF6' }}>
              {storyChapters.filter(ch => ch.completed).length}/{storyChapters.length}
            </Text>
          </View>
          <View style={{
            height: 8,
            backgroundColor: '#f3f4f6',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <View style={{
              height: '100%',
              width: `${(storyChapters.filter(ch => ch.completed).length / storyChapters.length) * 100}%`,
              backgroundColor: '#8B5CF6',
              borderRadius: 4,
            }} />
          </View>
        </View>

        <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 16 }}>
          Story Chapters
        </Text>
        
        {storyChapters.map((chapter) => (
          <TouchableOpacity
            key={chapter.id}
            style={{
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              opacity: chapter.locked ? 0.6 : 1,
            }}
            disabled={chapter.locked}
            onPress={() => {
              if (chapter.locked) {
                Alert.alert('Locked Chapter', 'Sign in to unlock this advanced chapter');
              } else {
                Alert.alert('Story Chapter', `Opening "${chapter.title}"\\n\\nThis will navigate to the full story content.`);
              }
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: chapter.completed ? '#10B981' : chapter.locked ? '#9CA3AF' : '#8B5CF6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                {chapter.completed ? '✓' : chapter.locked ? '🔒' : chapter.id}
              </Text>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: chapter.locked ? '#9CA3AF' : '#1f2937',
                marginBottom: 4,
              }}>
                {chapter.title}
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: chapter.locked ? '#9CA3AF' : '#6b7280',
                marginBottom: 4,
              }}>
                {chapter.description}
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: chapter.locked ? '#9CA3AF' : '#8B5CF6',
                fontWeight: '500',
              }}>
                {chapter.duration}
              </Text>
            </View>
            
            <Text style={{ fontSize: 18, color: '#8B5CF6' }}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 16,
          marginTop: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📚</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
            Interactive Learning
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 }}>
            Each chapter contains interactive elements, quizzes, and real farming scenarios to enhance your learning experience.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { session } = useSessionContext();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen 
        name="Story" 
        component={StoryScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📖</Text>,
          tabBarLabel: 'Story'
        }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎓</Text>,
          tabBarLabel: 'Learn'
        }}
      />
      <Tab.Screen 
        name="Games" 
        component={GamesScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎮</Text>,
          tabBarLabel: 'Games'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
          tabBarLabel: session ? 'Profile' : 'Account',
          tabBarBadge: !session ? '!' : undefined,
        }}
      />
      <Tab.Screen 
        name="Simulation" 
        component={SimulationScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🌱</Text>,
          tabBarLabel: 'Simulation'
        }}
      />
      <Tab.Screen 
        name="Certificates" 
        component={CertificatesScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏆</Text>,
          tabBarLabel: 'Certificates'
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
          tabBarLabel: 'Settings'
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { session, loading } = useSessionContext();

  // Debug: Force loading to false after 3 seconds
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('Debug: Force loading done', { session, loading });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [session, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <Text style={{ fontSize: 60, marginBottom: 16 }}>🌱</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>Harvestia</Text>
        <Text style={{ marginTop: 8, color: '#6b7280' }}>Loading mobile app...</Text>
        <Text style={{ marginTop: 8, color: '#9CA3AF', fontSize: 12 }}>Session: {session ? 'Yes' : 'No'}, Loading: {loading ? 'Yes' : 'No'}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={MainTabs} />
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SessionContextProvider>
      <AppContent />
    </SessionContextProvider>
  );
}
