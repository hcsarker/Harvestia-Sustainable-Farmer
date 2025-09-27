import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSessionContext } from '../contexts/SessionContext';

const { width } = Dimensions.get('window');

interface Decision {
  week: number;
  irrigation: number;
  fertilizer: number;
  pesticide: boolean;
}

interface OutcomeData {
  yield: number;
  targetYield: number;
  soilMoisture: number;
  etGap: number;
  nitrogenLeached: number;
  totalScore: number;
  weeklyData: Array<{ week: number; yield: number; moisture: number; et: number; nitrogen: number }>;
  costs: { irrigation: number; fertilizer: number; total: number };
  revenue: number;
  profit: number;
}

interface GameState {
  mode: 'sandbox' | 'drought' | 'monsoon';
  crop: 'wheat' | 'rice' | 'maize';
  soilType: 'clay' | 'loam' | 'sandy';
  location: { lat: number; lng: number; name: string } | null;
  currentWeek: number;
  isPlaying: boolean;
  playbackSpeed: number;
  budget: number;
  decisions: Decision[];
  outcomeData: OutcomeData;
  weatherForecast: string[];
}

const INITIAL_GAME_STATE: GameState = {
  mode: 'sandbox',
  crop: 'wheat',
  soilType: 'loam',
  location: { lat: 23.8103, lng: 90.4125, name: 'Dhaka, Bangladesh' },
  currentWeek: 1,
  isPlaying: false,
  playbackSpeed: 1,
  budget: 50000,
  decisions: [],
  outcomeData: {
    yield: 0,
    targetYield: 4.5,
    soilMoisture: 25,
    etGap: 20,
    nitrogenLeached: 15,
    totalScore: 75,
    weeklyData: [],
    costs: { irrigation: 0, fertilizer: 0, total: 0 },
    revenue: 0,
    profit: 0
  },
  weatherForecast: ['Sunny', 'Cloudy', 'Rainy']
};

const SCENARIOS = {
  sandbox: {
    title: 'Sandbox Mode',
    description: 'Experiment with different crops, soils, and strategies across seasons.',
    duration: 52,
    objectives: ['Learn farming strategies', 'Optimize resource use', 'Maximize yield'],
    icon: '🏖️',
    difficulty: 'Beginner'
  },
  drought: {
    title: 'Drought Challenge',
    description: 'Limited water supply - maintain ≥80% yield while reducing water use by 40%.',
    duration: 30,
    objectives: ['Keep yield ≥80%', 'Reduce water use 40%', 'Manage crop stress'],
    icon: '🌵',
    difficulty: 'Intermediate'
  },
  monsoon: {
    title: 'Monsoon Management',
    description: 'Time nitrogen application to avoid washout from forecasted rain bursts.',
    duration: 45,
    objectives: ['Optimize fertilizer timing', 'Prevent nutrient loss', 'Adapt to weather'],
    icon: '🌧️',
    difficulty: 'Advanced'
  }
};

const SimulationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { session, isGuest } = useSessionContext();
  
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [showSetup, setShowSetup] = useState(true);
  const [currentDecision, setCurrentDecision] = useState<Partial<Decision>>({});

  // Simulation timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.isPlaying && !showSetup) {
      const weekDuration = 1000 / gameState.playbackSpeed; // 1 second per week at 1x speed
      
      interval = setInterval(() => {
        setGameState(prev => {
          const scenario = SCENARIOS[prev.mode];
          if (prev.currentWeek >= scenario.duration) {
            // End simulation
            Alert.alert(
              "Simulation Complete!",
              `Final score: ${prev.outcomeData.totalScore}%`
            );
            return { ...prev, isPlaying: false };
          }
          
          // Update week and simulate progress
          const newWeek = prev.currentWeek + 1;
          const updatedOutcomes = simulateWeekProgress(prev, newWeek);
          
          return {
            ...prev,
            currentWeek: newWeek,
            outcomeData: updatedOutcomes
          };
        });
      }, weekDuration);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isPlaying, gameState.playbackSpeed, showSetup]);

  const simulateWeekProgress = (state: GameState, week: number) => {
    // Simplified simulation logic
    const baseYield = 0.05; // Base weekly yield increase
    const moistureDecay = 0.02; // Weekly moisture decrease
    const weatherFactor = Math.random() * 0.1 - 0.05; // Random weather impact
    
    const newYield = state.outcomeData.yield + baseYield + weatherFactor;
    const newMoisture = Math.max(10, state.outcomeData.soilMoisture - moistureDecay);
    
    // Update weekly data
    const newWeeklyData = [...state.outcomeData.weeklyData, {
      week,
      yield: newYield,
      moisture: newMoisture,
      et: state.outcomeData.etGap,
      nitrogen: state.outcomeData.nitrogenLeached
    }];
    
    // Calculate new score
    const yieldScore = Math.min(100, (newYield / state.outcomeData.targetYield) * 100);
    const moistureScore = newMoisture > 20 ? 100 : (newMoisture / 20) * 100;
    const totalScore = (yieldScore + moistureScore) / 2;
    
    return {
      ...state.outcomeData,
      yield: newYield,
      soilMoisture: newMoisture,
      totalScore,
      weeklyData: newWeeklyData,
      revenue: newYield * 500 * 10, // $500 per ton
      profit: (newYield * 500 * 10) - state.outcomeData.costs.total
    };
  };

  const startSimulation = useCallback(() => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to run agricultural simulations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Auth' as never) }
        ]
      );
      return;
    }

    setShowSetup(false);
    setGameState(prev => ({ 
      ...prev, 
      isPlaying: true, 
      currentWeek: 1,
      decisions: [],
      outcomeData: INITIAL_GAME_STATE.outcomeData
    }));
    Alert.alert('Simulation Started', `Starting ${gameState.crop} simulation in ${gameState.mode} mode!`);
  }, [gameState.crop, gameState.mode, isGuest, navigation]);

  const resetSimulation = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
    setShowSetup(true);
    setCurrentDecision({});
  }, []);

  const togglePlayback = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const makeDecision = useCallback(() => {
    if (!currentDecision.irrigation || !currentDecision.fertilizer) {
      Alert.alert('Incomplete Decision', 'Please make all required decisions for this week.');
      return;
    }

    const newDecision: Decision = {
      week: gameState.currentWeek,
      irrigation: currentDecision.irrigation || 0,
      fertilizer: currentDecision.fertilizer || 0,
      pesticide: currentDecision.pesticide || false
    };

    setGameState(prev => ({
      ...prev,
      decisions: [...prev.decisions, newDecision]
    }));

    setCurrentDecision({});
    Alert.alert('Decision Confirmed', 'Your farming decisions have been applied.');
  }, [currentDecision, gameState.currentWeek]);

  const crops = [
    { id: 'wheat', name: 'Wheat', icon: '🌾', season: 'Winter', duration: '16 weeks' },
    { id: 'rice', name: 'Rice', icon: '🌾', season: 'Monsoon', duration: '20 weeks' },
    { id: 'maize', name: 'Maize', icon: '🌽', season: 'Summer', duration: '14 weeks' }
  ];

  const soilTypes = [
    { id: 'clay', name: 'Clay Soil', retention: 'High', drainage: 'Poor', nutrients: 'Rich' },
    { id: 'loam', name: 'Loam Soil', retention: 'Medium', drainage: 'Good', nutrients: 'Balanced' },
    { id: 'sandy', name: 'Sandy Soil', retention: 'Low', drainage: 'Excellent', nutrients: 'Poor' }
  ];

  if (showSetup) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🧪 Agricultural Simulation</Text>
          <Text style={styles.subtitle}>Practice realistic farming decisions with AI-powered scenarios</Text>
          
          {isGuest && (
            <View style={styles.guestNotice}>
              <Text style={styles.guestNoticeText}>
                🎯 Sign in to save progress and unlock advanced features!
              </Text>
            </View>
          )}
        </View>

        {/* Scenario Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Simulation Mode</Text>
          {Object.entries(SCENARIOS).map(([key, scenario]) => (
            <TouchableOpacity 
              key={key}
              style={[
                styles.scenarioCard,
                gameState.mode === key && styles.selectedCard
              ]}
              onPress={() => setGameState(prev => ({ ...prev, mode: key as any }))}
            >
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioIcon}>{scenario.icon}</Text>
                <View style={styles.scenarioInfo}>
                  <Text style={styles.scenarioName}>{scenario.title}</Text>
                  <Text style={styles.scenarioDescription}>{scenario.description}</Text>
                </View>
                <View style={styles.scenarioMeta}>
                  <Text style={[styles.difficultyBadge, {
                    backgroundColor: scenario.difficulty === 'Beginner' ? '#f0fdf4' :
                                    scenario.difficulty === 'Intermediate' ? '#fffbeb' : '#fef2f2',
                    color: scenario.difficulty === 'Beginner' ? '#166534' :
                           scenario.difficulty === 'Intermediate' ? '#92400e' : '#991b1b'
                  }]}>{scenario.difficulty}</Text>
                  <Text style={styles.durationText}>{scenario.duration} weeks</Text>
                </View>
              </View>
              <View style={styles.featuresContainer}>
                {scenario.objectives.map((objective, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureText}>• {objective}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Crop Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Crop</Text>
          <View style={styles.optionsGrid}>
            {crops.map((crop) => (
              <TouchableOpacity
                key={crop.id}
                style={[
                  styles.optionCard,
                  gameState.crop === crop.id && styles.selectedOptionCard
                ]}
                onPress={() => setGameState(prev => ({ ...prev, crop: crop.id as any }))}
              >
                <Text style={styles.optionIcon}>{crop.icon}</Text>
                <Text style={styles.optionName}>{crop.name}</Text>
                <Text style={styles.optionMeta}>{crop.season}</Text>
                <Text style={styles.optionDuration}>{crop.duration}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Soil Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soil Type</Text>
          <View style={styles.optionsGrid}>
            {soilTypes.map((soil) => (
              <TouchableOpacity
                key={soil.id}
                style={[
                  styles.soilCard,
                  gameState.soilType === soil.id && styles.selectedSoilCard
                ]}
                onPress={() => setGameState(prev => ({ ...prev, soilType: soil.id as any }))}
              >
                <Text style={styles.soilName}>{soil.name}</Text>
                <View style={styles.soilProperties}>
                  <Text style={styles.soilProperty}>💧 {soil.retention} retention</Text>
                  <Text style={styles.soilProperty}>🚿 {soil.drainage} drainage</Text>
                  <Text style={styles.soilProperty}>🌱 {soil.nutrients} nutrients</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Location</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{gameState.location?.name}</Text>
              <Text style={styles.locationCoords}>
                Lat: {gameState.location?.lat.toFixed(4)}, Lng: {gameState.location?.lng.toFixed(4)}
              </Text>
            </View>
            <TouchableOpacity style={styles.changeLocationButton}>
              <Text style={styles.changeLocationText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.startButton} onPress={startSimulation}>
            <Text style={styles.startButtonText}>▶️ Start Simulation</Text>
          </TouchableOpacity>
          
          <View style={styles.simulationInfo}>
            <Text style={styles.infoTitle}>What you'll practice:</Text>
            <Text style={styles.infoItem}>• Weekly irrigation decisions</Text>
            <Text style={styles.infoItem}>• Fertilizer application timing</Text>
            <Text style={styles.infoItem}>• Pest and disease management</Text>
            <Text style={styles.infoItem}>• Weather adaptation strategies</Text>
            <Text style={styles.infoItem}>• Cost optimization techniques</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  }

  // Playing Mode UI
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Game Header */}
      <View style={styles.gameHeader}>
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>Week {gameState.currentWeek}</Text>
          <Text style={styles.gameSubtitle}>{gameState.crop} • {SCENARIOS[gameState.mode].title}</Text>
        </View>
        <View style={styles.gameControls}>
          <TouchableOpacity style={styles.controlButton} onPress={togglePlayback}>
            <Text style={styles.controlIcon}>{gameState.isPlaying ? '⏸️' : '▶️'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={resetSimulation}>
            <Text style={styles.controlIcon}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Status */}
      <View style={styles.statusSection}>
        <View style={styles.statusGrid}>
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>🌾</Text>
            <Text style={styles.statusValue}>{gameState.outcomeData.yield.toFixed(1)}t</Text>
            <Text style={styles.statusLabel}>Current Yield</Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>💧</Text>
            <Text style={styles.statusValue}>{gameState.outcomeData.soilMoisture.toFixed(0)}%</Text>
            <Text style={styles.statusLabel}>Soil Moisture</Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>📊</Text>
            <Text style={styles.statusValue}>{gameState.outcomeData.totalScore.toFixed(0)}%</Text>
            <Text style={styles.statusLabel}>Performance</Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>💰</Text>
            <Text style={styles.statusValue}>${gameState.budget.toLocaleString()}</Text>
            <Text style={styles.statusLabel}>Budget</Text>
          </View>
        </View>
      </View>

      {/* Decision Panel */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week's Decisions</Text>
        <View style={styles.decisionCard}>
          <View style={styles.decisionItem}>
            <Text style={styles.decisionLabel}>� Irrigation Amount</Text>
            <View style={styles.decisionOptions}>
              <TouchableOpacity 
                style={[
                  styles.decisionButton,
                  currentDecision.irrigation === 5 && styles.selectedDecision
                ]}
                onPress={() => setCurrentDecision(prev => ({ ...prev, irrigation: 5 }))}
              >
                <Text style={[
                  styles.decisionButtonText,
                  currentDecision.irrigation === 5 && styles.selectedText
                ]}>Low (5mm)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.decisionButton,
                  currentDecision.irrigation === 10 && styles.selectedDecision
                ]}
                onPress={() => setCurrentDecision(prev => ({ ...prev, irrigation: 10 }))}
              >
                <Text style={[
                  styles.decisionButtonText,
                  currentDecision.irrigation === 10 && styles.selectedText
                ]}>Medium (10mm)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.decisionButton,
                  currentDecision.irrigation === 15 && styles.selectedDecision
                ]}
                onPress={() => setCurrentDecision(prev => ({ ...prev, irrigation: 15 }))}
              >
                <Text style={[
                  styles.decisionButtonText,
                  currentDecision.irrigation === 15 && styles.selectedText
                ]}>High (15mm)</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.decisionItem}>
            <Text style={styles.decisionLabel}>� Fertilizer Application</Text>
            <View style={styles.decisionOptions}>
              <TouchableOpacity 
                style={[
                  styles.decisionButton,
                  currentDecision.fertilizer === 0 && styles.selectedDecision
                ]}
                onPress={() => setCurrentDecision(prev => ({ ...prev, fertilizer: 0 }))}
              >
                <Text style={[
                  styles.decisionButtonText,
                  currentDecision.fertilizer === 0 && styles.selectedText
                ]}>None</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.decisionButton,
                  currentDecision.fertilizer === 1 && styles.selectedDecision
                ]}
                onPress={() => setCurrentDecision(prev => ({ ...prev, fertilizer: 1 }))}
              >
                <Text style={[
                  styles.decisionButtonText,
                  currentDecision.fertilizer === 1 && styles.selectedText
                ]}>Nitrogen</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.decisionButton,
                  currentDecision.fertilizer === 2 && styles.selectedDecision
                ]}
                onPress={() => setCurrentDecision(prev => ({ ...prev, fertilizer: 2 }))}
              >
                <Text style={[
                  styles.decisionButtonText,
                  currentDecision.fertilizer === 2 && styles.selectedText
                ]}>NPK Mix</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={makeDecision}>
            <Text style={styles.confirmButtonText}>Confirm Decisions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Coach Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 AI Coach Tips</Text>
        <View style={styles.coachCard}>
          <Text style={styles.coachTip}>
            "Based on weather forecast, consider your irrigation carefully this week. Soil moisture is at {gameState.outcomeData.soilMoisture.toFixed(0)}%."
          </Text>
          <Text style={styles.coachReason}>
            Reasoning: Optimal soil moisture for {gameState.crop} is 40-60%. Adjust irrigation to maintain healthy levels.
          </Text>
        </View>
      </View>

      {/* Progress Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>� Weekly Progress</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Yield vs Target</Text>
            <Text style={styles.chartValue}>
              {gameState.outcomeData.yield.toFixed(1)}t / {gameState.outcomeData.targetYield}t
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(100, (gameState.outcomeData.yield / gameState.outcomeData.targetYield) * 100)}%`,
                  backgroundColor: gameState.outcomeData.yield >= gameState.outcomeData.targetYield * 0.8 ? '#10b981' : '#f59e0b'
                }
              ]} 
            />
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />
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
    backgroundColor: 'white',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  guestNotice: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  guestNoticeText: {
    color: '#92400e',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  scenarioCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scenarioIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  scenarioMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureTag: {
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: (width - 60) / 3,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOptionCard: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  optionMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  optionDuration: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  soilCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: (width - 60) / 3,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedSoilCard: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  soilName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  soilProperties: {
    alignItems: 'center',
  },
  soilProperty: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 12,
    color: '#6b7280',
  },
  changeLocationButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeLocationText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  simulationInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 18,
  },
  // Playing mode styles
  gameHeader: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  gameSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  gameControls: {
    flexDirection: 'row',
  },
  controlButton: {
    backgroundColor: '#f3f4f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  controlIcon: {
    fontSize: 18,
  },
  statusSection: {
    padding: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusCard: {
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
  statusIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  decisionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  decisionItem: {
    marginBottom: 20,
  },
  decisionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  decisionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  decisionButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedDecision: {
    backgroundColor: '#10b981',
  },
  decisionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedText: {
    color: 'white',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  coachCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  coachTip: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 18,
    marginBottom: 8,
  },
  coachReason: {
    fontSize: 12,
    color: '#a16207',
    fontStyle: 'italic',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  chartValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default SimulationScreen;