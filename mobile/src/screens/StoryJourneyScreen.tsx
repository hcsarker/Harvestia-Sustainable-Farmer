import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StoryJourneyScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Farm Story Journey</Text>
      <Text style={styles.subtitle}>Coming from web conversion...</Text>
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

export default StoryJourneyScreen;