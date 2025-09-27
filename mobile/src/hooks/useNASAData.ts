import { useState, useCallback } from 'react';

interface MODISResponse {
  data?: {
    ndvi_values?: Array<{ date: string; ndvi: number }>;
  };
}

interface GPMResponse {
  data?: {
    precipitation_data?: Array<{ date: string; precipitation_mm: number }>;
  };
}

export const useNASAData = () => {
  const [loading, setLoading] = useState(false);

  const fetchMODISData = useCallback(async (location: string): Promise<MODISResponse | null> => {
    setLoading(true);
    try {
      // Simulate MODIS NDVI data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: MODISResponse = {
        data: {
          ndvi_values: []
        }
      };
      
      // Generate 14 days of mock NDVI data
      for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.data!.ndvi_values!.push({
          date: date.toISOString().split('T')[0],
          ndvi: 0.3 + Math.random() * 0.4 // NDVI typically 0.3-0.7 for vegetation
        });
      }
      
      return mockData;
    } catch (error) {
      console.error('Error fetching MODIS data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGPMData = useCallback(async (lat: number, lon: number, location: string): Promise<GPMResponse | null> => {
    setLoading(true);
    try {
      // Simulate GPM precipitation data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData: GPMResponse = {
        data: {
          precipitation_data: []
        }
      };
      
      // Generate 7 days of mock precipitation data
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.data!.precipitation_data!.push({
          date: date.toISOString().split('T')[0],
          precipitation_mm: Math.random() * 10 // 0-10mm daily precipitation
        });
      }
      
      return mockData;
    } catch (error) {
      console.error('Error fetching GPM data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchMODISData,
    fetchGPMData,
    loading,
  };
};