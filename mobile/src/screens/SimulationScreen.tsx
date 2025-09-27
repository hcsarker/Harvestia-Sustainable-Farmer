import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import { useNavigation } from '@react-navigation/native';

interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  rewards: number;
  completed: boolean;
}

const SimulationScreen: React.FC = () => {
  const { session } = useSessionContext();
  const navigation = useNavigation();

  const scenarios: SimulationScenario[] = [
    {
      id: 'sim1',
      title: 'Seasonal Crop Planning',
      description: 'Plan your crops for the upcoming season based on weather predictions',
      difficulty: 'Easy',
      duration: '15 minutes',
      rewards: 50,
      completed: true,
    },
    {
      id: 'sim2',
      title: 'Irrigation Management',
      description: 'Optimize water usage during a drought period',
      difficulty: 'Medium',
      duration: '25 minutes',
      rewards: 100,
      completed: false,
    },
    {
      id: 'sim3',
      title: 'Pest Control Crisis',
      description: 'Handle a sudden pest outbreak using sustainable methods',
      difficulty: 'Hard',
      duration: '40 minutes',
      rewards: 200,
      completed: false,
    },
    {
      id: 'sim4',
      title: 'Climate Adaptation',
      description: 'Adapt your farming practices to changing climate conditions',
      difficulty: 'Hard',
      duration: '35 minutes',
      rewards: 150,
      completed: false,
    },
  ];

  const getDifficultyColor = (difficulty: SimulationScenario['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return '#10B981';
      case 'Medium':
        return '#F59E0B';
      case 'Hard':
        return '#EF4444';
    }
  };

  const handleSimulationPress = (scenario: SimulationScenario) => {
    Alert.alert(
      scenario.title,
      `${scenario.description}\n\nDuration: ${scenario.duration}\nRewards: ${scenario.rewards} points\n\nThis simulation will guide you through real farming decisions with immediate feedback.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Simulation',
          onPress: () => {
            Alert.alert('Simulation Started!', 'This would launch the full simulation experience.');
          }
        },
      ]
    );
  };

  const totalRewards = scenarios.filter(s => s.completed).reduce((sum, s) => sum + s.rewards, 0);
  const completedCount = scenarios.filter(s => s.completed).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Agricultural Simulation</Text>
        <Text style={styles.subtitle}>
          Practice real farming decisions in a risk-free environment
        </Text>

        {!session && (
          <View style={styles.guestNotice}>
            <Text style={styles.guestNoticeText}>
              🎯 Try simulations freely! Sign in to save progress and compete globally.
            </Text>
          </View>
        )}
      </View>

      {/* Progress Overview */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>📊 Your Progress</Text>
        <View style={styles.progressStats}>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>{completedCount}</Text>
            <Text style={styles.progressLabel}>Completed</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>{scenarios.length - completedCount}</Text>
            <Text style={styles.progressLabel}>Available</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressNumber}>{totalRewards}</Text>
            <Text style={styles.progressLabel}>Points Earned</Text>
          </View>
        </View>
      </View>

      {/* Simulation Scenarios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Simulations</Text>
        
        {scenarios.map((scenario) => (
          <TouchableOpacity
            key={scenario.id}
            style={[
              styles.scenarioCard,
              scenario.completed && styles.completedCard,
            ]}
            onPress={() => handleSimulationPress(scenario)}
          >
            <View style={styles.scenarioHeader}>
              <View style={styles.scenarioLeft}>
                <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                <Text style={styles.scenarioDescription}>{scenario.description}</Text>
              </View>
              <View style={styles.scenarioRight}>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(scenario.difficulty) },
                  ]}
                >
                  <Text style={styles.difficultyText}>{scenario.difficulty}</Text>
                </View>
                {scenario.completed && (
                  <Text style={styles.completedIcon}>✅</Text>
                )}
              </View>
            </View>

            <View style={styles.scenarioFooter}>
              <View style={styles.scenarioMeta}>
                <Text style={styles.metaText}>⏱️ {scenario.duration}</Text>
                <Text style={styles.metaText}>🎯 {scenario.rewards} points</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.startButton,
                  scenario.completed && styles.completedButton,
                ]}
                onPress={() => handleSimulationPress(scenario)}
              >
                <Text style={styles.startButtonText}>
                  {scenario.completed ? 'Replay' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Features Info */}
      <View style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>🌟 Simulation Features</Text>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🎯</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Realistic Scenarios</Text>
            <Text style={styles.featureDescription}>
              Based on real farming challenges and best practices
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📈</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Immediate Feedback</Text>
            <Text style={styles.featureDescription}>
              See the results of your decisions in real-time
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🏆</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Earn Rewards</Text>
            <Text style={styles.featureDescription}>
              Gain points and achievements for successful farming
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📚</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Learn by Doing</Text>
            <Text style={styles.featureDescription}>
              Practice makes perfect - no real-world risks
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#7C3AED',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e9d5ff',
  },
  guestNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  guestNoticeText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressCard: {
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
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  scenarioCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completedCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  scenarioLeft: {
    flex: 1,
    marginRight: 16,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  scenarioDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  scenarioRight: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  completedIcon: {
    fontSize: 20,
  },
  scenarioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scenarioMeta: {
    flex: 1,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  startButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  completedButton: {
    backgroundColor: '#10B981',
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  featuresCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default SimulationScreen;