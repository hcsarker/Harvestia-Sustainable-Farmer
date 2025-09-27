import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSessionContext } from '../contexts/SessionContext';

// Import mobile components (we'll create these)
import WeatherCard from '../components/WeatherCard';
import StatsCard from '../components/StatsCard';
import FarmingCard from '../components/FarmingCard';
import InteractiveChart from '../components/InteractiveChart';
import ProgressRing from '../components/ProgressRing';
import AnimatedCounter from '../components/AnimatedCounter';

// Import hooks (we'll adapt these from web)
import { useLocalWeather } from '../hooks/useLocalWeather';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useUserProgress } from '../hooks/useUserProgress';
import { useNASAData } from '../hooks/useNASAData';

const { width } = Dimensions.get('window');

const IndexScreen = () => {
  const navigation = useNavigation();
  const { session, user, isGuest } = useSessionContext();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Web hooks adapted for mobile
  const { last, series, coords } = useLocalWeather();
  const { achievementsCount, fieldsMonitored, waterEfficiency, sustainabilityScore, conditionsScore, farmHealth } = useDashboardStats();
  const { courseProgress, storyProgress } = useUserProgress();
  const { fetchMODISData, fetchGPMData } = useNASAData();
  
  // NDVI chart from MODIS (same as web)
  const [ndviSeries, setNdviSeries] = useState<Array<{ date: string; ndvi: number }>>([]);
  const [gpmToday, setGpmToday] = useState<number | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!coords) return;
      const loc = `${coords.lat.toFixed(3)},${coords.lon.toFixed(3)}`;
      const res = await fetchMODISData(loc) as { data?: { ndvi_values?: { date: string; ndvi: number }[] } } | null;
      if (!cancelled) {
        const vals = res?.data?.ndvi_values || [];
        setNdviSeries(vals);
      }
    };
    run();
    return () => { cancelled = true };
  }, [coords, fetchMODISData]);

  // Fetch GPM rainfall
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!coords) return;
      const loc = `${coords.lat.toFixed(3)},${coords.lon.toFixed(3)}`;
      const res = await fetchGPMData(coords.lat, coords.lon, loc) as { data?: { precipitation_data?: { date: string; precipitation_mm: number }[] } } | null;
      if (cancelled) return;
      const arr = res?.data?.precipitation_data || [];
      if (arr.length) {
        const lastEntry = arr[arr.length - 1];
        setGpmToday(typeof lastEntry.precipitation_mm === 'number' ? lastEntry.precipitation_mm : null);
      }
    };
    run();
    return () => { cancelled = true };
  }, [coords, fetchGPMData]);

  const ndviData = (ndviSeries && ndviSeries.length)
    ? ndviSeries.slice(-14).map(d => ({ day: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }), ndvi: Math.round(d.ndvi * 100) }))
    : [
        { day: 'Day 1', ndvi: 55 },
        { day: 'Day 2', ndvi: 57 },
        { day: 'Day 3', ndvi: 60 },
        { day: 'Day 4', ndvi: 62 },
        { day: 'Day 5', ndvi: 59 },
        { day: 'Day 6', ndvi: 61 },
        { day: 'Day 7', ndvi: 63 }
      ];

  // Dynamic metrics
  const currentTemp = typeof last?.T2M === 'number' ? last.T2M : null;
  const windSpeed = typeof last?.WS2M === 'number' ? last.WS2M : null;
  
  // Format helpers
  const fmt2 = (n: number | null | undefined) => (typeof n === 'number' ? n.toFixed(1) : '—');
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh data
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Farming modules data (same as web)
  const farmingModules = [
    {
      id: "crop",
      title: "Crop Management", 
      description: "AI-powered crop optimization using NASA satellite data for precision agriculture",
      icon: "🌱",
      color: "primary",
      stats: [
        { label: "Fields", value: String(fieldsMonitored || 12) },
        { label: "Health", value: typeof conditionsScore === 'number' ? `${Math.min(100, Math.max(0, conditionsScore + 5))}%` : '—' }
      ],
      features: [
        "NDVI vegetation monitoring",
        "Growth stage tracking", 
        "Disease early detection"
      ]
    },
    {
      id: "water",
      title: "Smart Irrigation",
      description: "Optimize water usage with real-time soil moisture and weather forecasting",
      icon: "💧",
      color: "accent",
      stats: [
        { label: "Efficiency", value: `${waterEfficiency || 85}%` },
        { label: "Saved", value: typeof sustainabilityScore === 'number' ? `${Math.round(sustainabilityScore % 50)}%` : '—' }
      ],
      features: [
        "Soil moisture tracking",
        "Weather-based scheduling",
        "Water conservation alerts"
      ]
    },
    {
      id: "livestock",
      title: "Livestock Tracking",
      description: "Monitor animal health, location, and grazing patterns for optimal farm management",
      icon: "🐄",
      color: "secondary",
      stats: [
        { label: "Animals", value: typeof achievementsCount === 'number' ? String(achievementsCount * 8) : '—' },
        { label: "Health", value: typeof conditionsScore === 'number' ? `${Math.min(100, Math.max(0, conditionsScore + 5))}%` : '—' }
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
      color: "muted",
      stats: [
        { label: "Data Points", value: series?.length ? String(series.length * 4) : '—' },
        { label: "Accuracy", value: typeof sustainabilityScore === 'number' ? `${Math.min(100, Math.round((sustainabilityScore % 100)))}%` : '—' }
      ],
      features: [
        "Predictive modeling",
        "Trend analysis", 
        "Custom reports"
      ]
    }
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌾 Farm Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          {user ? `Welcome back, ${user.email?.split('@')[0]}!` : 'Welcome to Harvestia!'}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionIcon}>☀️</Text>
          <Text style={styles.quickActionLabel}>Weather</Text>
          <Text style={styles.quickActionValue}>{fmt2(currentTemp)}°C{gpmToday != null ? ` · ${fmt2(gpmToday)}mm` : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionIcon}>📊</Text>
          <Text style={styles.quickActionLabel}>Analytics</Text>
          <Text style={styles.quickActionValue}>{series?.length || 0} pts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionIcon}>❤️</Text>
          <Text style={styles.quickActionLabel}>Health</Text>
          <Text style={styles.quickActionValue}>{fmt2(farmHealth)}%</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatsCard 
            title="Achievements" 
            value={String(achievementsCount || 0)} 
            icon="🏆" 
          />
          <StatsCard 
            title="Fields" 
            value={String(fieldsMonitored || 0)} 
            icon="🌾" 
          />
        </View>
        <View style={styles.statsRow}>
          <StatsCard 
            title="Water Efficiency" 
            value={`${waterEfficiency || 0}%`} 
            icon="💧" 
          />
          <StatsCard 
            title="Farm Health" 
            value={`${fmt2(farmHealth)}%`} 
            icon="❤️" 
          />
        </View>
      </View>

      {/* Weather Widget */}
      <WeatherCard weather={last} gpmToday={gpmToday} />

      {/* Interactive Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>📈 NDVI Vegetation Index</Text>
        <InteractiveChart data={ndviData} />
      </View>

      {/* Farming Modules */}
      <View style={styles.modulesContainer}>
        <Text style={styles.sectionTitle}>🚀 Farming Modules</Text>
        {farmingModules.map((module) => (
          <FarmingCard
            key={module.id}
            module={module}
            onPress={() => setSelectedModule(module.id)}
            selected={selectedModule === module.id}
          />
        ))}
      </View>

      {/* Course & Story Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>📚 Course Progress</Text>
          <ProgressRing progress={courseProgress || 0} />
          <Text style={styles.progressText}>{Math.round(courseProgress || 0)}% Complete</Text>
        </View>
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>📖 Story Progress</Text>
          <ProgressRing progress={storyProgress || 0} />
          <Text style={styles.progressText}>{Math.round(storyProgress || 0)}% Complete</Text>
        </View>
      </View>

      {/* Guest Mode Notice */}
      {isGuest && (
        <TouchableOpacity 
          style={styles.guestNotice}
          onPress={() => navigation.navigate('Auth' as never)}
        >
          <Text style={styles.guestNoticeIcon}>👋</Text>
          <View style={styles.guestNoticeContent}>
            <Text style={styles.guestNoticeTitle}>Sign in for full access</Text>
            <Text style={styles.guestNoticeText}>Save progress, earn certificates, and sync across devices</Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  quickActionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  modulesContainer: {
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  progressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  guestNotice: {
    backgroundColor: '#f0f9ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0284c7',
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
    color: '#0284c7',
    marginBottom: 4,
  },
  guestNoticeText: {
    fontSize: 14,
    color: '#0369a1',
  },
});

export default IndexScreen;