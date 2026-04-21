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
  /** Whether the store has been initialized with client-side defaults */
  initialized: boolean
  initialize: () => void
  setCuisines: (cuisines: CuisineType[]) => void
  setVibes: (vibes: VibeTag[]) => void
  setAreas: (areas: string[]) => void
  setPriceRange: (priceRange: number[]) => void
  toggleOpenNow: () => void
  clearAll: () => void
}

// Amendment 3: Open Now defaults to true between 11am-12am.
// This must only run on the client — running it during module init on the
// server would produce a different boolean than the client, causing a
// hydration mismatch.
function getOpenNowDefault(): boolean {
  const hour = new Date().getHours()
  return hour >= 11 || hour === 0 // 11am to 12am (midnight)
}

const initialFilters = {
  cuisines: [] as CuisineType[],
  vibes: [] as VibeTag[],
  areas: [] as string[],
  priceRange: [] as number[],
  // Conservative default during SSR; client flips it on mount via initialize().
  openNow: false,
}

export const useFiltersStore = create<FiltersState>((set, get) => ({
  activeFilters: initialFilters,
  initialized: false,

  initialize: () => {
    if (get().initialized) return
    set((state) => ({
      initialized: true,
      activeFilters: {
        ...state.activeFilters,
        openNow: getOpenNowDefault(),
      },
    }))
  },

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
      activeFilters: { ...initialFilters, openNow: getOpenNowDefault() },
      initialized: true,
    }),
}))
