import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSessionContext } from '../contexts/SessionContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { session } = useSessionContext();
  
  // Dashboard stats matching web exactly
  const [dashboardStats] = useState({
    fieldsMonitored: 12,
    waterEfficiency: 87,
    sustainabilityScore: 94,
    achievementsCount: 15,
    farmHealth: 92,
    conditionsScore: 85,
    courseProgress: 75,
    storyProgress: 60
  });
  
  // Weather data matching web
  const [weatherData] = useState({
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    location: 'Dhaka, Bangladesh',
    feelsLike: 31
  });
  
  // Analytics matching web
  const [analyticsData] = useState({
    ndviLatest: 68,
    dataPoints: 240,
    accuracy: 94,
    alerts: 2
  });

  // Farming modules exactly like web
  const farmingModules = [
    {
      id: "crops",
      title: "Crop Management",
      description: "Advanced monitoring and optimization of crop growth using real-time satellite data and AI-powered insights",
      icon: "🌾",
      color: "#10B981",
      stats: [
        { label: "Fields", value: String(dashboardStats.fieldsMonitored) },
        { label: "Health", value: `${dashboardStats.conditionsScore}%` }
      ],
      features: [
        "Real-time health monitoring",
        "Predictive yield analysis", 
        "Disease detection alerts"
      ]
    },
    {
      id: "irrigation",
      title: "Smart Irrigation",
      description: "Precision water management system powered by SMAP soil moisture data and weather forecasting",
      icon: "💧",
      color: "#06B6D4",
      stats: [
        { label: "Water Saved", value: `${Math.max(0, dashboardStats.waterEfficiency - 10)}%` },
        { label: "Efficiency", value: `${dashboardStats.waterEfficiency}%` }
      ],
      features: [
        "Automated scheduling",
        "Soil moisture tracking",
        "Weather integration"
      ]
    },
    {
      id: "livestock",
      title: "Livestock Grazing",
      description: "Optimize pasture management and animal health through satellite vegetation monitoring",
      icon: "🐄",
      color: "#F59E0B",
      stats: [
        { label: "Pastures", value: String(Math.max(1, dashboardStats.fieldsMonitored - 4)) },
        { label: "Health", value: `${Math.min(100, Math.max(0, dashboardStats.conditionsScore + 5))}%` }
      ],
      features: [
        "Grazing rotation planning",
        "Vegetation health tracking",
        "Animal location monitoring"
      ]
    },
    {
      id: "analytics",
      title: "Farm Analytics",
      description: "Comprehensive data insights and reporting from NASA climate datasets and IoT sensors",
      icon: "📊",
      color: "#8B5CF6",
      stats: [
        { label: "Data Points", value: String(analyticsData.dataPoints) },
        { label: "Accuracy", value: `${analyticsData.accuracy}%` }
      ],
      features: [
        "Predictive modeling",
        "Trend analysis",
        "Custom reports"
      ]
    },
    {
      id: "mapping",
      title: "Field Mapping",
      description: "Interactive high-resolution satellite imagery analysis with boundary detection and change monitoring",
      icon: "🗺️",
      color: "#EF4444",
      stats: [
        { label: "Resolution", value: "10cm" },
        { label: "Updates", value: "Daily" }
      ],
      features: [
        "Boundary mapping",
        "Change detection",
        "3D visualization"
      ]
    },
    {
      id: "learning",
      title: "Farming Guide",
      description: "Interactive learning platform with courses, tutorials, and expert guidance for sustainable practices",
      icon: "📚",
      color: "#06B6D4",
      stats: [
        { label: "Courses", value: "12" },
        { label: "Progress", value: `${dashboardStats.courseProgress}%` }
      ],
      features: [
        "Expert-led courses",
        "Practical tutorials",
        "Community forum"
      ]
    }
  ];

  // Quick actions matching web
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

  const statsCards = [
    {
      title: "Fields Monitored",
      value: dashboardStats.fieldsMonitored,
      icon: "🗺️",
      trend: { value: 8.5, isPositive: true },
      color: "#10B981"
    },
    {
      title: "Water Efficiency", 
      value: `${dashboardStats.waterEfficiency}%`,
      icon: "💧",
      trend: { value: 12.3, isPositive: true },
      color: "#06B6D4"
    },
    {
      title: "Sustainability Score",
      value: dashboardStats.sustainabilityScore,
      icon: "🛡️", 
      trend: { value: 5.7, isPositive: true },
      color: "#10B981"
    },
    {
      title: "Achievements",
      value: dashboardStats.achievementsCount,
      icon: "🏆",
      trend: { value: 16.2, isPositive: true },
      color: "#F59E0B"
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section - exactly like web */}
      <View style={styles.welcomeSection}>
        <Text style={styles.mainTitle}>🌾 HARVESTIA 🛰️</Text>
        <Text style={styles.welcomeText}>
          Welcome back, <Text style={styles.userName}>{session?.user?.email?.split('@')[0] || 'Sustainable Farmer'}!</Text>
        </Text>
        <Text style={styles.description}>
          Your intelligent gateway to data-driven sustainable agriculture using cutting-edge NASA satellite insights and precision farming technology
        </Text>
        
        {/* Live Stats Banner - like web */}
        <View style={styles.liveStatsBanner}>
          <View style={styles.liveStatItem}>
            <View style={styles.greenDot} />
            <Text style={styles.liveStatText}>System Active</Text>
          </View>
          <View style={styles.liveStatItem}>
            <Text style={styles.liveStatIcon}>🌡️</Text>
            <Text style={styles.liveStatText}>{weatherData.temperature}°C</Text>
          </View>
          <View style={styles.liveStatItem}>
            <Text style={styles.liveStatIcon}>🌧️</Text>
            <Text style={styles.liveStatText}>{weatherData.condition}</Text>
          </View>
        </View>
      </View>

      {/* Simulation Promo - matching web */}
      <View style={styles.simulationPromo}>
        <Text style={styles.promoTitle}>🧪 Agricultural Simulation</Text>
        <Text style={styles.promoDescription}>
          Practice weekly farming decisions in realistic scenarios. Test your knowledge and improve your skills with our AI-powered simulation.
        </Text>
        <TouchableOpacity style={styles.promoButton} onPress={() => navigation.navigate('Simulation' as never)}>
          <Text style={styles.promoButtonText}>Start Simulation</Text>
        </TouchableOpacity>
      </View>

      {/* Weather & Soil Section - like web grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Conditions</Text>
        <View style={styles.conditionsGrid}>
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <Text style={styles.weatherLocation}>📍 {weatherData.location}</Text>
              <Text style={styles.weatherTime}>Updated: {new Date().toLocaleTimeString()}</Text>
            </View>
            <View style={styles.weatherMain}>
              <Text style={styles.weatherIcon}>☀️</Text>
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTemp}>{weatherData.temperature}°C</Text>
                <Text style={styles.weatherDesc}>{weatherData.condition}</Text>
              </View>
              <View style={styles.weatherStats}>
                <Text style={styles.weatherStat}>💧 Humidity: {weatherData.humidity}%</Text>
                <Text style={styles.weatherStat}>💨 Wind: {weatherData.windSpeed} km/h</Text>
                <Text style={styles.weatherStat}>🌡️ Feels like: {weatherData.feelsLike}°C</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.soilCard}>
            <Text style={styles.soilTitle}>🌱 Soil Moisture</Text>
            <View style={styles.soilMain}>
              <Text style={styles.soilValue}>68%</Text>
              <Text style={styles.soilStatus}>Optimal</Text>
            </View>
            <Text style={styles.soilAdvice}>Perfect conditions for planting. Soil moisture levels are ideal.</Text>
          </View>
        </View>
      </View>

      {/* Enhanced Stats Grid - exactly like web */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dashboard Overview</Text>
        <View style={styles.statsGrid}>
          {statsCards.map((stat, index) => (
            <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statTrend, { color: stat.trend.isPositive ? '#10B981' : '#EF4444' }]}>
                  {stat.trend.isPositive ? '↗' : '↘'} {stat.trend.value}%
                </Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Progress Overview - like web */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Overview</Text>
        <View style={styles.progressGrid}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Learning Progress</Text>
              <Text style={styles.progressIcon}>📚</Text>
            </View>
            <View style={styles.progressRing}>
              <Text style={styles.progressPercent}>{dashboardStats.courseProgress}%</Text>
            </View>
            <Text style={styles.progressDescription}>9 of 12 courses completed</Text>
          </View>
          
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Farm Health</Text>
              <Text style={styles.progressIcon}>❤️</Text>
            </View>
            <View style={styles.progressRing}>
              <Text style={styles.progressPercent}>{dashboardStats.farmHealth}%</Text>
            </View>
            <Text style={styles.progressDescription}>Excellent conditions</Text>
          </View>
          
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Weekly Goals</Text>
              <Text style={styles.progressIcon}>🎯</Text>
            </View>
            <View style={styles.progressRing}>
              <Text style={styles.progressPercent}>85%</Text>
            </View>
            <Text style={styles.progressDescription}>4 of 5 goals achieved</Text>
          </View>
        </View>
      </View>

      {/* Farming Modules - exactly like web enhanced cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farming Modules</Text>
        {farmingModules.map((module, index) => (
          <TouchableOpacity key={index} style={[styles.moduleCard, { borderLeftColor: module.color }]} onPress={() => Alert.alert(module.title, module.description)}>
            <View style={styles.moduleHeader}>
              <View style={styles.moduleInfo}>
                <View style={styles.moduleTitleRow}>
                  <Text style={styles.moduleIcon}>{module.icon}</Text>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                </View>
                <Text style={styles.moduleDescription}>{module.description}</Text>
              </View>
            </View>
            <View style={styles.moduleStats}>
              {module.stats.map((stat, statIndex) => (
                <View key={statIndex} style={styles.moduleStat}>
                  <Text style={styles.moduleStatValue}>{stat.value}</Text>
                  <Text style={styles.moduleStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.moduleFeatures}>
              {module.features.map((feature, featureIndex) => (
                <Text key={featureIndex} style={styles.moduleFeature}>• {feature}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions - enhanced like web */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <TouchableOpacity key={index} style={[styles.actionCard, { borderLeftColor: action.color, borderLeftWidth: 4 }]} onPress={action.onPress}>
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <View style={styles.actionTextContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Data Sources - like web */}
      <View style={styles.section}>
        <View style={styles.dataSourcesCard}>
          <Text style={styles.dataSourcesTitle}>📡 Data Sources</Text>
          <Text style={styles.dataSourcesText}>
            Real-time agricultural intelligence powered by NASA satellite data, local weather stations, and IoT sensors for precise farming decisions.
          </Text>
          <View style={styles.sourceTags}>
            <View style={styles.sourceTag}>
              <Text style={styles.sourceTagText}>NASA POWER</Text>
            </View>
            <View style={styles.sourceTag}>
              <Text style={styles.sourceTagText}>MODIS NDVI</Text>
            </View>
            <View style={styles.sourceTag}>
              <Text style={styles.sourceTagText}>SMAP Soil</Text>
            </View>
            <View style={styles.sourceTag}>
              <Text style={styles.sourceTagText}>GPM Rainfall</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  userName: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  liveStatsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f0f9f4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#10B981',
    opacity: 0.8,
  },
  liveStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
    marginRight: 6,
  },
  liveStatIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  liveStatText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  simulationPromo: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 10,
  },
  promoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  promoButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  conditionsGrid: {
    gap: 15,
  },
  weatherCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 15,
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
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  soilCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  soilTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  soilMain: {
    alignItems: 'center',
    marginBottom: 15,
  },
  soilValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
  },
  soilStatus: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  soilAdvice: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    backgroundColor: '#f0f9f4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: (width - 60) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 20,
  },
  statTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: (width - 70) / 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  progressIcon: {
    fontSize: 16,
  },
  progressRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f9f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#10B981',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  moduleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
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
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  actionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionTextContent: {
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
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  arrow: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  dataSourcesCard: {
    backgroundColor: 'white',
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