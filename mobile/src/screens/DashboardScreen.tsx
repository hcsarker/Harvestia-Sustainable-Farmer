import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSessionContext } from '../contexts/SessionContext';

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  location: string;
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { session } = useSessionContext();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const stats = [
    { title: 'Achievements', value: session ? '7' : '12', color: '#10B981', icon: '🏆' },
    { title: 'Fields Monitored', value: session ? '3' : '5', color: '#3B82F6', icon: '🌾' },
    { title: 'Water Efficiency', value: session ? '85%' : '92%', color: '#06B6D4', icon: '💧' },
    { title: 'Sustainability Score', value: session ? '78%' : '85%', color: '#10B981', icon: '♻️' },
  ];

  const farmingModules = [
    { title: 'Weather Monitoring', subtitle: 'Real-time conditions', icon: '🌤️', onPress: () => {} },
    { title: 'Soil Health', subtitle: 'Monitor soil moisture', icon: '🌱', onPress: () => {} },
    { title: 'Crop Analytics', subtitle: 'Growth predictions', icon: '📊', onPress: () => {} },
    { title: 'Water Management', subtitle: 'Irrigation planning', icon: '💧', onPress: () => {} },
  ];

  const quickActions = [
    { title: 'Agricultural Simulation', subtitle: 'Weekly farming decisions', icon: '🧪', onPress: () => Alert.alert('Simulation', 'Advanced farming simulation coming soon!') },
    { title: 'Continue Story', subtitle: 'Chapter 3: Climate Data', icon: '📖', onPress: () => navigation.navigate('Story' as never) },
    { title: 'NASA Data Insights', subtitle: 'Satellite farming data', icon: '🛰️', onPress: () => Alert.alert('NASA Data', 'Satellite data visualization available on web version') },
    { title: 'Learning Courses', subtitle: 'Master new skills', icon: '🎓', onPress: () => navigation.navigate('Courses' as never) },
  ];

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      // Simulate weather API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWeather({
        temperature: 28,
        humidity: 65,
        condition: 'Partly Cloudy',
        location: 'Farm Location'
      });
    } catch (error) {
      console.error('Failed to load weather:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeatherData();
    setRefreshing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {session ? 'Welcome back! 🌾' : 'Welcome to Harvestia! 🌱'}
        </Text>
        <Text style={styles.subtitle}>
          {session 
            ? 'Continue your sustainable farming journey' 
            : 'Start your sustainable farming education journey'
          }
        </Text>
        {!session && (
          <TouchableOpacity 
            style={styles.signInPrompt} 
            onPress={() => navigation.navigate('Auth' as never)}
          >
            <Text style={styles.signInPromptText}>🔐 Sign in for personalized experience</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <TouchableOpacity key={index} style={styles.actionCard} onPress={action.onPress}>
            <View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#10B981',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1fae5',
  },
  signInPrompt: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  signInPromptText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  weatherCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: -10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
    marginRight: 20,
  },
  weatherDetails: {
    flex: 1,
  },
  condition: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  humidity: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
  },
  weatherAdvice: {
    backgroundColor: '#f0f9f4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  adviceText: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsContainer: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moduleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  moduleSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  arrow: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: 'bold',
  },
  dataSourcesCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dataSourcesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  dataSourcesText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  sourceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sourceTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  sourceTagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
});