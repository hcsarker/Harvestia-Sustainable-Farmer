import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';

import { TextStyle } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 2000, 
  style 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(progress * value));
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [value, duration]);

  return (
    <Text style={[styles.counter, style]}>
      {displayValue}
    </Text>
  );
};

const styles = StyleSheet.create({
  counter: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
});

export default AnimatedCounter;