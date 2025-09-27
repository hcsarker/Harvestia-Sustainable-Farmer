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

interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  bestScore: number;
  timesPlayed: number;
}

const GamesScreen: React.FC = () => {
  const { session } = useSessionContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const games: Game[] = [
    {
      id: 'game1',
      title: 'Crop Matching Quiz',
      description: 'Match crops with their ideal growing conditions',
      category: 'Quiz',
      difficulty: 'Easy',
      points: 50,
      bestScore: 85,
      timesPlayed: 12,
    },
    {
      id: 'game2',
      title: 'Pest Identification',
      description: 'Identify common farm pests and their solutions',
      category: 'Educational',
      difficulty: 'Medium',
      points: 75,
      bestScore: 92,
      timesPlayed: 8,
    },
    {
      id: 'game3',
      title: 'Weather Forecast Challenge',
      description: 'Predict weather patterns and plan farm activities',
      category: 'Strategy',
      difficulty: 'Hard',
      points: 100,
      bestScore: 0,
      timesPlayed: 0,
    },
    {
      id: 'game4',
      title: 'Soil Health Analyzer',
      description: 'Test your knowledge of soil composition and health',
      category: 'Quiz',
      difficulty: 'Medium',
      points: 60,
      bestScore: 78,
      timesPlayed: 5,
    },
    {
      id: 'game5',
      title: 'Farm Planning Simulator',
      description: 'Design and manage your virtual sustainable farm',
      category: 'Simulation',
      difficulty: 'Hard',
      points: 120,
      bestScore: 0,
      timesPlayed: 0,
    },
    {
      id: 'game6',
      title: 'Seed Knowledge Race',
      description: 'Quick-fire questions about seeds and planting',
      category: 'Quiz',
      difficulty: 'Easy',
      points: 40,
      bestScore: 95,
      timesPlayed: 15,
    },
  ];

  const categories = ['All', 'Quiz', 'Educational', 'Strategy', 'Simulation'];

  const filteredGames = selectedCategory === 'All' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const getDifficultyColor = (difficulty: Game['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return '#10B981';
      case 'Medium':
        return '#F59E0B';
      case 'Hard':
        return '#EF4444';
    }
  };

  const handleGamePress = (game: Game) => {
    Alert.alert(
      game.title,
      `Ready to play? This game is worth ${game.points} points!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Game',
          onPress: () => {
            console.log('Starting game:', game.title);
            // Future: Navigate to game screen
          },
        },
      ]
    );
  };

  const getTotalPoints = () => {
    return games.reduce((total, game) => total + (game.bestScore > 0 ? game.points : 0), 0);
  };

  const getGamesCompleted = () => {
    return games.filter(game => game.bestScore > 0).length;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Mini Games</Text>
        <Text style={styles.subtitle}>Learn while having fun!</Text>
        
        {!session && (
          <View style={styles.guestNotice}>
            <Text style={styles.guestNoticeText}>
              🎯 Play all games freely! Sign in to save scores and compete on leaderboards.
            </Text>
          </View>
        )}
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getTotalPoints()}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getGamesCompleted()}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{games.length}</Text>
            <Text style={styles.statLabel}>Total Games</Text>
          </View>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.gamesContainer}>
        {filteredGames.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => handleGamePress(game)}
          >
            <View style={styles.gameHeader}>
              <View style={styles.gameTitleContainer}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(game.difficulty) }
                ]}>
                  <Text style={styles.difficultyText}>{game.difficulty}</Text>
                </View>
              </View>
              
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>{game.points}pts</Text>
              </View>
            </View>

            <Text style={styles.gameDescription}>{game.description}</Text>
            
            <View style={styles.gameStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Category:</Text>
                <Text style={styles.statValue}>{game.category}</Text>
              </View>
              
              {game.bestScore > 0 ? (
                <>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Best Score:</Text>
                    <Text style={styles.statValue}>{game.bestScore}%</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Times Played:</Text>
                    <Text style={styles.statValue}>{game.timesPlayed}</Text>
                  </View>
                </>
              ) : (
                <View style={styles.newGameIndicator}>
                  <Text style={styles.newGameText}>🆕 New Game</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.playButton}>
              <Text style={styles.playButtonText}>
                {game.bestScore > 0 ? 'Play Again' : 'Start Game'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Play games to earn points and unlock special achievements! 🏆
        </Text>
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
    backgroundColor: '#8B5CF6',
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
    color: '#E9D5FF',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#E9D5FF',
    marginTop: 4,
  },
  categoriesContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedCategory: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  gamesContainer: {
    padding: 16,
  },
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gameTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  pointsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: 'bold',
  },
  gameDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  gameStats: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  newGameIndicator: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  newGameText: {
    fontSize: 14,
    color: '#15803D',
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  guestNotice: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  guestNoticeText: {
    color: '#d97706',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default GamesScreen;