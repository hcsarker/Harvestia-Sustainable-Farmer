import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ChartData {
  day?: string;
  date?: string;
  ndvi?: number;
  value?: number;
  label?: string;
}

interface InteractiveChartProps {
  data: ChartData[];
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const values = data.map(d => d.value ?? d.ndvi ?? 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  return (
    <View style={styles.container}>
      {/* Simple bar chart */}
      <View style={styles.chartArea}>
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const dataValue = item.value ?? item.ndvi ?? 0;
            const height = ((dataValue - minValue) / range) * 120 + 20;
            const displayDate = item.date ? new Date(item.date).getDate().toString() : item.day ?? index.toString();
            const displayValue = item.label ?? (item.value?.toFixed(1)) ?? (item.ndvi?.toFixed(2)) ?? '0';
            
            return (
              <View key={index} style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { height }
                  ]} 
                />
                <Text style={styles.barLabel}>{displayDate}</Text>
                <Text style={styles.barValue}>{displayValue}</Text>
              </View>
            );
          })}
        </View>
      </View>
      
      <Text style={styles.description}>
        Data visualization from NASA satellite sensors
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
  noDataText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    padding: 20,
  },
});

export default InteractiveChart;