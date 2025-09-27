import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ChartData {
  day: string;
  ndvi: number;
}

interface InteractiveChartProps {
  data: ChartData[];
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.ndvi));
  const minValue = Math.min(...data.map(d => d.ndvi));
  const range = maxValue - minValue || 1;

  return (
    <View style={styles.container}>
      {/* Simple bar chart */}
      <View style={styles.chartArea}>
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const height = ((item.ndvi - minValue) / range) * 120 + 20;
            return (
              <View key={index} style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { height }
                  ]} 
                />
                <Text style={styles.barLabel}>{item.day}</Text>
                <Text style={styles.barValue}>{item.ndvi}</Text>
              </View>
            );
          })}
        </View>
      </View>
      
      <Text style={styles.description}>
        Vegetation health over time (NDVI index from satellite data)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartArea: {
    width: screenWidth - 64,
    height: 180,
    padding: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  bar: {
    backgroundColor: '#8B5CF6',
    width: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
    textAlign: 'center',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default InteractiveChart;