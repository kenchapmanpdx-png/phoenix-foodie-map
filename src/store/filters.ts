import { create } from 'zustand'
import type { CuisineType, VibeTag } from '@/types'

interface FiltersState {
  activeFilters: {
    cuisines: CuisineType[]
    vibes: VibeTag[]
    areas: string[]
    priceRange: number[]
    openNow: boolean
  }
  setCuisines: (cuisines: CuisineType[]) => void
  setVibes: (vibes: VibeTag[]) => void
  setAreas: (areas: string[]) => void
  setPriceRange: (priceRange: number[]) => void
  toggleOpenNow: () => void
  clearAll: () => void
}

const initialFilters = {
  cuisines: [] as CuisineType[],
  vibes: [] as VibeTag[],
  areas: [] as string[],
  priceRange: [] as number[],
  openNow: false,
}

export const useFiltersStore = create<FiltersState>((set) => ({
  activeFilters: initialFilters,

  setCuisines: (cuisines) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, cuisines },
    })),

  setVibes: (vibes) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, vibes },
    })),

  setAreas: (areas) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, areas },
    })),

  setPriceRange: (priceRange) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, priceRange },
    })),

  toggleOpenNow: () =>
    set((state) => ({
      activeFilters: {
        ...state.activeFilters,
        openNow: !state.activeFilters.openNow,
      },
    })),

  clearAll: () =>
    set({
      activeFilters: initialFilters,
    }),
}))
