import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChapterContentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chapter Content</Text>
      <Text style={styles.subtitle}>Story chapter content will be displayed here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});