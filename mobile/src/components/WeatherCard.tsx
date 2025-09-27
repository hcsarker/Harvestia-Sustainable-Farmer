import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WeatherData {
  T2M?: number;
  WS2M?: number;
  RH2M?: number;
  ALLSKY_SFC_UVA?: number;
}

interface WeatherCardProps {
  weather: WeatherData | null;
  gpmToday: number | null;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, gpmToday }) => {
  const fmt2 = (n: number | null | undefined) => (typeof n === 'number' ? n.toFixed(1) : '—');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌤️ Current Weather</Text>
      
      <View style={styles.mainWeather}>
        <Text style={styles.temperature}>
          {fmt2(weather?.T2M)}°C
        </Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>
            💨 Wind: {fmt2(weather?.WS2M)} m/s
          </Text>
          <Text style={styles.detailText}>
            💧 Humidity: {fmt2(weather?.RH2M)}%
          </Text>
          {gpmToday !== null && (
            <Text style={styles.detailText}>
              🌧️ Rain: {fmt2(gpmToday)} mm
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.forecast}>
        <Text style={styles.forecastTitle}>Today's Conditions</Text>
        <View style={styles.forecastItems}>
          <View style={styles.forecastItem}>
            <Text style={styles.forecastIcon}>☀️</Text>
            <Text style={styles.forecastLabel}>UV Index</Text>
            <Text style={styles.forecastValue}>
              {typeof weather?.ALLSKY_SFC_UVA === 'number' ? Math.round(weather.ALLSKY_SFC_UVA) : '—'}
            </Text>
          </View>
          <View style={styles.forecastItem}>
            <Text style={styles.forecastIcon}>🌡️</Text>
            <Text style={styles.forecastLabel}>Feel Like</Text>
            <Text style={styles.forecastValue}>
              {fmt2(weather?.T2M ? weather.T2M + 2 : null)}°C
            </Text>
          </View>
          <View style={styles.forecastItem}>
            <Text style={styles.forecastIcon}>👁️</Text>
            <Text style={styles.forecastLabel}>Visibility</Text>
            <Text style={styles.forecastValue}>Good</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  mainWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0284c7',
    marginRight: 20,
  },
  details: {
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  forecast: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  forecastTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  forecastItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  forecastItem: {
    alignItems: 'center',
    flex: 1,
  },
  forecastIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  forecastLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default WeatherCard;