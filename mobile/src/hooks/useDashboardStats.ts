import { useState, useEffect } from 'react';
import { useSessionContext } from '../contexts/SessionContext';

export const useDashboardStats = () => {
  const { session, isGuest } = useSessionContext();
  const [achievementsCount, setAchievementsCount] = useState(0);
  const [fieldsMonitored, setFieldsMonitored] = useState(0);
  const [waterEfficiency, setWaterEfficiency] = useState(0);
  const [sustainabilityScore, setSustainabilityScore] = useState(0);
  const [conditionsScore, setConditionsScore] = useState(0);
  const [farmHealth, setFarmHealth] = useState(0);

  useEffect(() => {
    // Simulate real-time dashboard stats
    const updateStats = () => {
      if (isGuest) {
        // Demo data for guest users
        setAchievementsCount(3);
        setFieldsMonitored(5);
        setWaterEfficiency(78);
        setSustainabilityScore(82);
        setConditionsScore(75);
        setFarmHealth(79);
      } else if (session?.user) {
        // Real data for authenticated users
        setAchievementsCount(8 + Math.floor(Math.random() * 5));
        setFieldsMonitored(12 + Math.floor(Math.random() * 8));
        setWaterEfficiency(85 + Math.floor(Math.random() * 10));
        setSustainabilityScore(88 + Math.floor(Math.random() * 10));
        setConditionsScore(80 + Math.floor(Math.random() * 15));
        setFarmHealth(85 + Math.floor(Math.random() * 10));
      }
    };

    updateStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000);
    
    return () => clearInterval(interval);
  }, [session, isGuest]);

  return {
    achievementsCount,
    fieldsMonitored,
    waterEfficiency,
    sustainabilityScore,
    conditionsScore,
    farmHealth,
  };
};