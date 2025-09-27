import { useState, useEffect } from 'react';

interface WeatherData {
  T2M?: number;
  WS2M?: number;
  RH2M?: number;
  ALLSKY_SFC_UVA?: number;
}

interface Coordinates {
  lat: number;
  lon: number;
}

interface WeatherSeries {
  date: string;
  temperature: number;
  humidity: number;
}

export const useLocalWeather = () => {
  const [last, setLast] = useState<WeatherData | null>(null);
  const [series, setSeries] = useState<WeatherSeries[]>([]);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user location
    const getLocation = async () => {
      try {
        // For demo purposes, use default coordinates
        const defaultCoords = { lat: 23.8103, lon: 90.4125 }; // Dhaka, Bangladesh
        setCoords(defaultCoords);
        
        // Simulate weather data
        const mockWeather: WeatherData = {
          T2M: 28.5 + Math.random() * 5, // 28-33°C
          WS2M: 2.1 + Math.random() * 3, // 2-5 m/s
          RH2M: 65 + Math.random() * 20, // 65-85%
          ALLSKY_SFC_UVA: 5 + Math.random() * 5, // UV index 5-10
        };
        
        setLast(mockWeather);
        
        // Generate mock series data
        const mockSeries: WeatherSeries[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockSeries.push({
            date: date.toISOString().split('T')[0],
            temperature: 25 + Math.random() * 10,
            humidity: 60 + Math.random() * 30,
          });
        }
        setSeries(mockSeries.reverse());
        
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  return {
    last,
    series,
    coords,
    loading,
  };
};