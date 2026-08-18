import { useEffect } from 'react';
import { useFarmStore } from '../store/farmStore';

export function useFarms() {
  const { farms, activeFarm, loading, loadFarms, setActiveFarm, createFarm, updateFarm, deleteFarm } = useFarmStore();

  useEffect(() => {
    if (farms.length === 0) {
      loadFarms();
    }
  }, []);

  return {
    farms,
    activeFarm,
    loading,
    loadFarms,
    setActiveFarm,
    createFarm,
    updateFarm,
    deleteFarm,
  };
}