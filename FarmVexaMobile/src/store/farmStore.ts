import { create } from 'zustand';
import { farmApi } from '../api/axios';

interface Farm {
  _id: string;
  name: string;
  location?: {
    county?: string;
    subCounty?: string;
  };
  size?: {
    value?: number;
    unit?: string;
  };
  status?: string;
}

interface FarmState {
  farms: Farm[];
  activeFarm: Farm | null;
  loading: boolean;
  loadFarms: () => Promise<void>;
  setActiveFarm: (farm: Farm | null) => void;
  createFarm: (data: any) => Promise<any>;
  updateFarm: (id: string, data: any) => Promise<any>;
  deleteFarm: (id: string) => Promise<any>;
}

export const useFarmStore = create<FarmState>((set, get) => ({
  farms: [],
  activeFarm: null,
  loading: false,

  loadFarms: async () => {
    set({ loading: true });
    try {
      const res = await farmApi.getFarms();
      const farms = res.data.data.farms || [];
      set({ farms, loading: false });
      
      // Set first farm as active if none selected
      if (farms.length > 0 && !get().activeFarm) {
        set({ activeFarm: farms[0] });
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setActiveFarm: (farm: Farm | null) => {
    set({ activeFarm: farm });
  },

  createFarm: async (data: any) => {
    const res = await farmApi.createFarm(data);
    await get().loadFarms();
    return res.data;
  },

  updateFarm: async (id: string, data: any) => {
    const res = await farmApi.updateFarm(id, data);
    await get().loadFarms();
    return res.data;
  },

  deleteFarm: async (id: string) => {
    await farmApi.deleteFarm(id);
    await get().loadFarms();
  },
}));