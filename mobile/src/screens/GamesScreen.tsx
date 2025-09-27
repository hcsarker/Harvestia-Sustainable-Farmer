import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSessionContext } from '../contexts/SessionContext';

interface GameModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  players: number;
  rating: number;
  category: 'Quiz' | 'Strategy' | 'Simulation' | 'Puzzle';
  unlocked: boolean;
}

const GAMES: GameModule[] = [
  {
    id: 'farming-quiz',
    title: 'Sustainable Farming Quiz',
    description: 'Test your knowledge about sustainable farming practices and techniques',
    icon: '🧠',
    difficulty: 'Easy',
    players: 1250,
    rating: 4.7,
    category: 'Quiz',
    unlocked: true,
  },
  {
    id: 'crop-rotation',
    title: 'Crop Rotation Strategy',
    description: 'Plan the optimal crop rotation for maximum yield and soil health',
    icon: '🔄',
    difficulty: 'Medium',
    players: 890,
    rating: 4.8,
    category: 'Strategy',
    unlocked: true,
  },
  {
    id: 'weather-prediction',
    title: 'Weather Prediction Challenge',
    description: 'Use weather data to make farming decisions and maximize profits',
    icon: '🌦️',
    difficulty: 'Hard',
    players: 650,
    rating: 4.6,
    category: 'Simulation',
    unlocked: true,
  },
  {
    id: 'pest-management',
    title: 'Pest Management Puzzle',
    description: 'Solve pest control challenges using natural and sustainable methods',
    icon: '🐛',
    difficulty: 'Medium',
    players: 720,
    rating: 4.5,
    category: 'Puzzle',
    unlocked: false,
  },
  {
    id: 'water-conservation',
    title: 'Water Conservation Game',
    description: 'Optimize irrigation systems and conserve water resources effectively',
    icon: '💧',
    difficulty: 'Medium',
    players: 580,
    rating: 4.7,
    category: 'Strategy',
    unlocked: false,
  },
  {
    id: 'soil-health-quiz',
    title: 'Soil Health Master',
    description: 'Learn about soil composition, nutrients, and health indicators',
    icon: '🌱',
    difficulty: 'Easy',
    players: 1100,
    rating: 4.8,
    category: 'Quiz',
    unlocked: true,
  },
];

export default function GamesScreen() {
  const navigation = useNavigation();
  const { session, isGuest } = useSessionContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showGameModal, setShowGameModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameModule | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});

  const categories = ['All', 'Quiz', 'Strategy', 'Simulation', 'Puzzle'];

  useEffect(() => {
    // Load user progress for games
    if (!isGuest) {
      const mockProgress: Record<string, number> = {
        'farming-quiz': 85,
        'crop-rotation': 62,
        'soil-health-quiz': 94,
        'weather-prediction': 38,
      };
      setUserProgress(mockProgress);
    }
  }, [isGuest]);

  const filteredGames = GAMES.filter(game => {
    if (selectedCategory === 'All') return true;
    return game.category === selectedCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleGamePress = (game: GameModule) => {
    if (!game.unlocked) {
      Alert.alert(
        'Game Locked',
        'Complete more courses and quizzes to unlock this game!',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Create a free account to play games and save your progress.',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Sign Up', onPress: () => navigation.navigate('Auth' as never) },
        ]
      );
      return;
    }

    setSelectedGame(game);
    setShowGameModal(true);
  };

  const playGame = (game: GameModule) => {
    setShowGameModal(false);
    
    // Simulate game play
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; // 60-100 score
      Alert.alert(
        'Game Complete! 🎉',
        `${game.title}\\n\\nYour Score: ${score}%\\n${score > 80 ? 'Excellent work!' : score > 60 ? 'Good job!' : 'Keep practicing!'}`,
        [
          { text: 'Play Again', onPress: () => playGame(game) },
          { text: 'Back to Games', style: 'cancel' },
        ]
      );
      
      // Update progress
      setUserProgress(prev => ({
        ...prev,
        [game.id]: Math.max(prev[game.id] || 0, score),
      }));
    }, 2000);

    Alert.alert('Starting Game...', 'Get ready to test your farming knowledge!');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Learning Games</Text>
        <Text style={styles.subtitle}>
          Learn farming through interactive games and challenges
        </Text>
      </View>

      {/* Guest Notice */}
      {isGuest && (
        <TouchableOpacity 
          style={styles.guestNotice}
          onPress={() => navigation.navigate('Auth' as never)}
        >
          <Text style={styles.guestNoticeIcon}>🏆</Text>
          <View style={styles.guestNoticeContent}>
            <Text style={styles.guestNoticeTitle}>Unlock Game Progress</Text>
            <Text style={styles.guestNoticeText}>
              Sign up to save scores, compete with others, and unlock achievements
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Games Grid */}
      <View style={styles.gamesContainer}>
        {filteredGames.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[
              styles.gameCard,
              !game.unlocked && styles.gameCardLocked
            ]}
            onPress={() => handleGamePress(game)}
            activeOpacity={0.8}
          >
            {/* Game Icon & Lock Overlay */}
            <View style={styles.gameIconContainer}>
              <Text style={[styles.gameIcon, !game.unlocked && styles.gameIconLocked]}>
                {game.unlocked ? game.icon : '🔒'}
              </Text>
              {!game.unlocked && (
                <View style={styles.lockOverlay}>
                  <Text style={styles.lockText}>LOCKED</Text>
                </View>
              )}
            </View>

            {/* Game Info */}
            <View style={styles.gameInfo}>
              <Text style={[styles.gameTitle, !game.unlocked && styles.gameTextLocked]}>
                {game.title}
              </Text>
              <Text style={[styles.gameDescription, !game.unlocked && styles.gameTextLocked]} numberOfLines={2}>
                {game.description}
              </Text>

              {/* Game Stats */}
              <View style={styles.gameStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>⭐</Text>
                  <Text style={styles.statText}>{game.rating}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>👥</Text>
                  <Text style={styles.statText}>{game.players}</Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(game.difficulty) }]}>
                  <Text style={styles.difficultyText}>{game.difficulty}</Text>
                </View>
              </View>

              {/* Progress (for authenticated users) */}
              {!isGuest && game.unlocked && userProgress[game.id] && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>Best Score: {userProgress[game.id]}%</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${userProgress[game.id]}%` }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Game Modal */}
      <Modal
        visible={showGameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedGame && (
              <>
                <Text style={styles.modalIcon}>{selectedGame.icon}</Text>
                <Text style={styles.modalTitle}>{selectedGame.title}</Text>
                <Text style={styles.modalDescription}>{selectedGame.description}</Text>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Difficulty</Text>
                    <Text style={[styles.modalStatValue, { color: getDifficultyColor(selectedGame.difficulty) }]}>
                      {selectedGame.difficulty}
                    </Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Players</Text>
                    <Text style={styles.modalStatValue}>{selectedGame.players}</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Rating</Text>
                    <Text style={styles.modalStatValue}>⭐ {selectedGame.rating}</Text>
                  </View>
                </View>

                {!isGuest && userProgress[selectedGame.id] && (
                  <View style={styles.modalProgress}>
                    <Text style={styles.modalProgressText}>
                      Your Best Score: {userProgress[selectedGame.id]}%
                    </Text>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowGameModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.playButton}
                    onPress={() => playGame(selectedGame)}
                  >
                    <Text style={styles.playButtonText}>Play Now</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Achievement Section */}
      <View style={styles.achievementSection}>
        <Text style={styles.achievementTitle}>🏆 Your Gaming Achievements</Text>
        <View style={styles.achievementGrid}>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>🎯</Text>
            <Text style={styles.achievementName}>Quiz Master</Text>
            <Text style={styles.achievementDesc}>Complete 5 quizzes</Text>
            <Text style={styles.achievementProgress}>{isGuest ? '0/5' : '3/5'}</Text>
          </View>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>🔥</Text>
            <Text style={styles.achievementName}>Streak Champion</Text>
            <Text style={styles.achievementDesc}>7-day play streak</Text>
            <Text style={styles.achievementProgress}>{isGuest ? '0/7' : '4/7'}</Text>
          </View>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>⭐</Text>
            <Text style={styles.achievementName}>Perfect Score</Text>
            <Text style={styles.achievementDesc}>Score 100% in any game</Text>
            <Text style={styles.achievementProgress}>{isGuest ? 'Locked' : 'Unlocked'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  guestNotice: {
    backgroundColor: '#fef3c7',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
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
    color: '#92400e',
    marginBottom: 4,
  },
  guestNoticeText: {
    fontSize: 14,
    color: '#a16207',
  },
  categoriesContainer: {
    paddingVertical: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  gamesContainer: {
    paddingHorizontal: 16,
  },
  gameCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
  },
  gameCardLocked: {
    opacity: 0.6,
  },
  gameIconContainer: {
    position: 'relative',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameIcon: {
    fontSize: 48,
  },
  gameIconLocked: {
    opacity: 0.5,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lockText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#ffffff',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  gameTextLocked: {
    opacity: 0.6,
  },
  gameStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalProgress: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  modalProgressText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  playButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
    marginLeft: 8,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  achievementSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '31%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementProgress: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8b5cf6',
  },
});