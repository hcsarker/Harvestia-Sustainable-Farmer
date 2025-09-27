import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  progress, 
  size = 60, 
  strokeWidth = 6 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background circle */}
      <View 
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: '#e2e8f0',
          }
        ]} 
      />
      
      {/* Progress circle - simulated with border */}
      <View 
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: '#8B5CF6',
            // Simulate progress with transform
            transform: [{ rotate: `${(progress / 100) * 360}deg` }],
          }
        ]} 
      />
      
      <View style={styles.textContainer}>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
    borderTopColor: '#8B5CF6',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default ProgressRing;