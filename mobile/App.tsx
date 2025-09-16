import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { SessionContextProvider } from './src/contexts/SessionContext';

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>{title}</Text>
      <Text style={{ marginTop: 8 }}>Coming soon...</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" children={() => <PlaceholderScreen title="Dashboard" />} />
      <Tab.Screen name="Story" children={() => <PlaceholderScreen title="Story Journey" />} />
      <Tab.Screen name="Courses" children={() => <PlaceholderScreen title="Courses" />} />
      <Tab.Screen name="Games" children={() => <PlaceholderScreen title="Mini Games" />} />
      <Tab.Screen name="Profile" children={() => <PlaceholderScreen title="Profile" />} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SessionContextProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Root" component={MainTabs} />
          <Stack.Screen name="Auth" children={() => <PlaceholderScreen title="Auth" />} />
        </Stack.Navigator>
      </NavigationContainer>
    </SessionContextProvider>
  );
}
