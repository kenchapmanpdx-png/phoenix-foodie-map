import { create } from 'zustand'
import type { User } from '@/types'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  savedContentIds: string[]
  savedRestaurantIds: string[]
  setUser: (user: User | null) => void
  logout: () => void
  toggleSaveContent: (contentId: string) => void
  toggleSaveRestaurant: (restaurantId: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  savedContentIds: [],
  savedRestaurantIds: [],

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      savedContentIds: [],
      savedRestaurantIds: [],
    }),

  toggleSaveContent: (contentId) =>
    set((state) => ({
      savedContentIds: state.savedContentIds.includes(contentId)
        ? state.savedContentIds.filter((id) => id !== contentId)
        : [...state.savedContentIds, contentId],
    })),

  toggleSaveRestaurant: (restaurantId) =>
    set((state) => ({
      savedRestaurantIds: state.savedRestaurantIds.includes(restaurantId)
        ? state.savedRestaurantIds.filter((id) => id !== restaurantId)
        : [...state.savedRestaurantIds, restaurantId],
    })),
}))
