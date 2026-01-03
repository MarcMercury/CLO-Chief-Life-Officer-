/**
 * PropertyStore - Manages selected property state
 * 
 * Uses Zustand for global state management of which property
 * is currently selected in the Home section.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Property {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  type: 'home' | 'vacation' | 'rental' | 'office' | 'storage' | 'vehicle' | 'other';
  is_primary: boolean;
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface PropertyState {
  // Currently selected property for the Home view
  selectedPropertyId: string | null;
  
  // Actions
  setSelectedProperty: (propertyId: string | null) => void;
  
  // Helper for "All Properties" view
  isAllPropertiesSelected: () => boolean;
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      selectedPropertyId: null, // null means "show primary" initially
      
      setSelectedProperty: (propertyId) => {
        set({ selectedPropertyId: propertyId });
      },
      
      isAllPropertiesSelected: () => {
        return get().selectedPropertyId === 'all';
      },
    }),
    {
      name: 'clo-property-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
