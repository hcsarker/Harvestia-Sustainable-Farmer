import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VerifyCertificateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Verify Certificate</Text>
      <Text style={styles.subtitle}>Certificate verification system</Text>
      <Text style={styles.description}>
        Enter certificate ID to verify authenticity
      </Text>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#10B981',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});