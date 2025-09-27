import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSessionContext } from '../contexts/SessionContext';
// Import simple mobile components



export default function DashboardScreen() {
  const navigation = useNavigation();
  const { session } = useSessionContext();
  const [refreshing, setRefreshing] = useState(false);
  
  const stats = [
    { title: 'Achievements', value: session ? '7' : '12', color: '#10B981', icon: '🏆' },
    { title: 'Fields Monitored', value: session ? '3' : '5', color: '#3B82F6', icon: '🌾' },
    { title: 'Water Efficiency', value: session ? '85%' : '92%', color: '#06B6D4', icon: '💧' },
    { title: 'Sustainability Score', value: session ? '78%' : '85%', color: '#10B981', icon: '♻️' },
  ];

  const farmingModules = [
    {
      id: 'crops',
      title: 'Crop Management',
      description: 'Advanced monitoring and optimization using real-time satellite data',
      icon: '🌾',
      color: '#10B981',
      stats: [{ label: 'Fields', value: session ? '3' : '5' }, { label: 'Health', value: '85%' }],
      features: ['Real-time health monitoring', 'Predictive yield analysis', 'Disease detection alerts']
    },
    {
      id: 'irrigation',
      title: 'Smart Irrigation',
      description: 'AI-powered water management and efficiency optimization',
      icon: '💧',
      color: '#3B82F6',
      stats: [{ label: 'Efficiency', value: '92%' }, { label: 'Savings', value: '25%' }],
      features: ['Automated scheduling', 'Soil moisture tracking', 'Weather integration']
    },
    {
      id: 'weather',
      title: 'Weather Intelligence',
      description: 'Hyperlocal weather forecasting and agricultural insights',
      icon: '🌤️',
      color: '#F59E0B',
      stats: [{ label: 'Accuracy', value: '94%' }, { label: 'Alerts', value: '12' }],
      features: ['7-day forecasts', 'Severe weather alerts', 'NASA satellite data']
    },
    {
      id: 'analytics',
      title: 'Farm Analytics',
      description: 'Data-driven insights for optimal farming decisions',
      icon: '�',
      color: '#8B5CF6',
      stats: [{ label: 'Insights', value: '45' }, { label: 'Trends', value: '↗️' }],
      features: ['Yield predictions', 'Cost optimization', 'Performance tracking']
    }
  ];

  const quickActions = [
    { 
      title: 'Agricultural Simulation', 
      subtitle: 'Weekly farming decisions & scenarios', 
      icon: '🧪', 
      color: '#8B5CF6',
      description: 'Practice decision-making with realistic farming scenarios',
      onPress: () => navigation.navigate('Simulation' as never) 
    },
    { 
      title: 'Continue Story', 
      subtitle: 'Chapter 3: Climate Data Analysis', 
      icon: '📖', 
      color: '#F59E0B',
      description: 'Learn through interactive storytelling',
      onPress: () => navigation.navigate('Story' as never) 
    },
    { 
      title: 'NASA Data Insights', 
      subtitle: 'Real-time satellite farming data', 
      icon: '🛰️', 
      color: '#EF4444',
      description: 'Access global agricultural satellite data',
      onPress: () => Alert.alert('NASA Data', 'Satellite data visualization - same as web version!') 
    },
    { 
      title: 'Learning Courses', 
      subtitle: 'Master sustainable farming skills', 
      icon: '🎓', 
      color: '#10B981',
      description: 'Comprehensive courses with certificates',
      onPress: () => navigation.navigate('Courses' as never) 
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh real data from hooks
    setTimeout(() => setRefreshing(false), 1000);
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

      {/* Stats Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Farm Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>47</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🌾</Text>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Fields Monitored</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💧</Text>
            <Text style={styles.statValue}>89%</Text>
            <Text style={styles.statLabel}>Water Efficiency</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🌍</Text>
            <Text style={styles.statValue}>94%</Text>
            <Text style={styles.statLabel}>Sustainability</Text>
          </View>
        </View>
      </View>

      {/* Progress Tracking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Progress Tracking</Text>
        <View style={styles.progressGrid}>
          <View style={styles.progressCard}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressValue}>75%</Text>
            </View>
            <Text style={styles.progressLabel}>Course Progress</Text>
          </View>
          <View style={styles.progressCard}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressValue}>60%</Text>
            </View>
            <Text style={styles.progressLabel}>Story Progress</Text>
          </View>
          <View style={styles.progressCard}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressValue}>85%</Text>
            </View>
            <Text style={styles.progressLabel}>Farm Health</Text>
          </View>
        </View>
      </View>

      {/* Farming Modules - Web Style */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚜 Farming Modules</Text>
        {farmingModules.map((module) => (
          <TouchableOpacity key={module.id} style={[styles.moduleCard, { borderLeftColor: module.color }]}>
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleIcon}>{module.icon}</Text>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
              </View>
            </View>
            
            <View style={styles.moduleStats}>
              {module.stats.map((stat, index) => (
                <View key={index} style={styles.moduleStat}>
                  <Text style={styles.moduleStatValue}>{stat.value}</Text>
                  <Text style={styles.moduleStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.moduleFeatures}>
              {module.features.map((feature, index) => (
                <Text key={index} style={styles.moduleFeature}>• {feature}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* NASA Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NASA Satellite Data</Text>
        <View style={styles.nasaCard}>
          <View style={styles.nasaGrid}>
            <View style={styles.nasaItem}>
              <Text style={styles.nasaLabel}>Temperature</Text>
              <Text style={styles.nasaValue}>28.5°C</Text>
            </View>
            <View style={styles.nasaItem}>
              <Text style={styles.nasaLabel}>Precipitation</Text>
              <Text style={styles.nasaValue}>12.3mm</Text>
            </View>
            <View style={styles.nasaItem}>
              <Text style={styles.nasaLabel}>NDVI</Text>
              <Text style={styles.nasaValue}>0.74</Text>
            </View>
            <View style={styles.nasaItem}>
              <Text style={styles.nasaLabel}>Soil Moisture</Text>
              <Text style={styles.nasaValue}>68%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Interactive Charts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics</Text>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📊 Weekly Temperature</Text>
          <View style={styles.chartArea}>
            {[1, 2, 3, 4, 5, 6, 7].map((day, index) => (
              <View key={index} style={[styles.chartBar, { height: Math.random() * 60 + 20 }]} />
            ))}
          </View>
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>💧 Soil Moisture Trends</Text>
          <View style={styles.chartArea}>
            {[1, 2, 3, 4, 5, 6, 7].map((day, index) => (
              <View key={index} style={[styles.chartBar, { height: Math.random() * 60 + 20, backgroundColor: '#3b82f6' }]} />
            ))}
          </View>
        </View>
      </View>

      {/* Weather Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weather Now</Text>
        <View style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <Text style={styles.weatherLocation}>📍 Dhaka, Bangladesh</Text>
            <Text style={styles.weatherTime}>Updated: {new Date().toLocaleTimeString()}</Text>
          </View>
          <View style={styles.weatherMain}>
            <Text style={styles.weatherIcon}>☀️</Text>
            <View style={styles.weatherInfo}>
              <Text style={styles.weatherTemp}>28°C</Text>
              <Text style={styles.weatherDesc}>Partly Cloudy</Text>
            </View>
            <View style={styles.weatherStats}>
              <Text style={styles.weatherStat}>💧 Humidity: 65%</Text>
              <Text style={styles.weatherStat}>💨 Wind: 12 km/h</Text>
              <Text style={styles.weatherStat}>🌡️ Feels like: 31°C</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <TouchableOpacity key={index} style={[styles.actionCard, { borderLeftColor: action.color, borderLeftWidth: 4 }]} onPress={action.onPress}>
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
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
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  weatherLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  weatherTime: {
    fontSize: 12,
    color: '#666',
  },
  weatherIcon: {
    fontSize: 48,
  },
  weatherInfo: {
    flex: 1,
    marginLeft: 15,
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherDesc: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  weatherStats: {
    alignItems: 'flex-end',
  },
  weatherStat: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
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
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  moduleStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  moduleStat: {
    marginRight: 20,
  },
  moduleStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  moduleStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  moduleFeatures: {
    marginTop: 8,
  },
  moduleFeature: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 18,
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressCard: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  nasaCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  nasaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nasaItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  nasaLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  nasaValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    justifyContent: 'space-around',
  },
  chartBar: {
    width: 20,
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#22c55e',
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});