import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { session, signOut } = useSessionContext();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const profileStats = [
    { label: 'Level', value: '12', icon: '🏆' },
    { label: 'XP Points', value: '2,450', icon: '⭐' },
    { label: 'Certificates', value: '3', icon: '📜' },
    { label: 'Streak', value: '7 days', icon: '🔥' },
  ];

  const achievements = [
    { title: 'First Steps', description: 'Completed first course', earned: true },
    { title: 'Quiz Master', description: 'Scored 90%+ on 5 quizzes', earned: true },
    { title: 'Story Teller', description: 'Finished story journey', earned: false },
    { title: 'Green Thumb', description: 'Mastered all games', earned: false },
  ];

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleSignInPress = () => {
    navigation.navigate('Auth' as never);
  };

  if (!session) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>👤 Profile</Text>
          <Text style={styles.subtitle}>Track your learning journey</Text>
        </View>

        <View style={styles.guestContainer}>
          <View style={styles.guestCard}>
            <Text style={styles.guestIcon}>🌱</Text>
            <Text style={styles.guestTitle}>Welcome, Guest!</Text>
            <Text style={styles.guestDescription}>
              Sign in to track your progress, earn achievements, and access personalized features.
            </Text>
            
            <TouchableOpacity style={styles.signInButton} onPress={handleSignInPress}>
              <Text style={styles.signInButtonText}>🔐 Sign In to Continue</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.guestFeatures}>
            <Text style={styles.featuresTitle}>What you'll get with an account:</Text>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Track learning progress across courses</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={styles.featureText}>Earn achievements and certificates</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎮</Text>
              <Text style={styles.featureText}>Save game scores and compete</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📈</Text>
              <Text style={styles.featureText}>Personal statistics and insights</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {session.user.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{session.user.email}</Text>
        <Text style={styles.email}>Sustainable Farmer</Text>
      </View>

      <View style={styles.statsContainer}>
        {profileStats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements.map((achievement, index) => (
          <View key={index} style={[styles.achievementCard, !achievement.earned && styles.lockedCard]}>
            <Text style={styles.achievementIcon}>{achievement.earned ? '🏆' : '🔒'}</Text>
            <View style={styles.achievementContent}>
              <Text style={[styles.achievementTitle, !achievement.earned && styles.lockedText]}>
                {achievement.title}
              </Text>
              <Text style={[styles.achievementDescription, !achievement.earned && styles.lockedText]}>
                {achievement.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Settings</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Privacy Policy</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#10B981',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  achievementCard: {
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
  },
  lockedCard: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  lockedText: {
    opacity: 0.7,
  },
  menuItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  signOutText: {
    color: '#ef4444',
  },
  arrow: {
    fontSize: 18,
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
    marginTop: 8,
  },
  guestContainer: {
    padding: 20,
  },
  guestCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  guestIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  guestDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  signInButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  guestFeatures: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
});