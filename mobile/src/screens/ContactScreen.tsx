import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ContactScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📞 Contact Us</Text>
        <Text style={styles.subtitle}>Get in touch with the Harvestia team</Text>
        <Text style={styles.description}>
          For questions, feedback, or support, please reach out to us.
        </Text>
        <Text style={styles.email}>📧 support@harvestia.com</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    alignItems: 'center',
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
    lineHeight: 24,
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: 'bold',
  },
});