import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  stats: Array<{ label: string; value: string }>;
  features: string[];
}

interface FarmingCardProps {
  module: Module;
  onPress: () => void;
  selected: boolean;
}

const FarmingCard: React.FC<FarmingCardProps> = ({ module, onPress, selected }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, selected && styles.selected]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{module.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{module.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{module.description}</Text>
        </View>
      </View>
      
      <View style={styles.stats}>
        {module.stats.map((stat, index) => (
          <View key={index} style={styles.stat}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
      
      {selected && (
        <View style={styles.features}>
          {module.features.map((feature, index) => (
            <Text key={index} style={styles.feature}>• {feature}</Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#faf5ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  features: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  feature: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
});

export default FarmingCard;