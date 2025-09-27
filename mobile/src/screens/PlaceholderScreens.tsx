import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AgriculturalSimulationScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Agricultural Simulation</Text>
      <Text style={styles.subtitle}>Converting from web app...</Text>
    </View>
  );
};

const MiniGamesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Mini Games</Text>
      <Text style={styles.subtitle}>Converting from web app...</Text>
    </View>
  );
};

const FactsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💡 Facts</Text>
      <Text style={styles.subtitle}>Converting from web app...</Text>
    </View>
  );
};

const QuizzesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>❓ Quizzes</Text>
      <Text style={styles.subtitle}>Converting from web app...</Text>
    </View>
  );
};

const QuizExamScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Quiz Exam</Text>
      <Text style={styles.subtitle}>Converting from web app...</Text>
    </View>
  );
};

const ChapterContentScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 Chapter Content</Text>
      <Text style={styles.subtitle}>Converting from web app...</Text>
    </View>
  );
};

const CourseDetailScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Course Detail</Text>
      <Text style={styles.subtitle}>Converting from web app...</Text>
    </View>
  );
};

const MyResultsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 My Results</Text>
      <Text style={styles.subtitle}>Converting from web app...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
});

export {
  AgriculturalSimulationScreen,
  MiniGamesScreen,
  FactsScreen,
  QuizzesScreen,
  QuizExamScreen,
  ChapterContentScreen,
  CourseDetailScreen,
  MyResultsScreen,
};