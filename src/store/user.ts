import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface UserState {
  user: User | null
  isAuthenticated: boolean
  savedContentIds: string[]
  savedRestaurantIds: string[]
  setUser: (user: User | null) => void
  logout: () => void
  toggleSaveContent: (contentId: string) => void
  toggleSaveRestaurant: (restaurantId: string) => void
  syncSavesFromRemote: () => Promise<void>
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      savedContentIds: [],
      savedRestaurantIds: [],

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
        if (user && UUID_RE.test(user.id)) {
          void get().syncSavesFromRemote()
        }
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          savedContentIds: [],
          savedRestaurantIds: [],
        }),

      toggleSaveContent: (contentId) => {
        const { user, savedContentIds } = get()
        const isSaved = savedContentIds.includes(contentId)
        set({
          savedContentIds: isSaved
            ? savedContentIds.filter((id) => id !== contentId)
            : [...savedContentIds, contentId],
        })
        if (user && UUID_RE.test(user.id)) {
          if (isSaved) {
            void supabase
              .from('saves')
              .delete()
              .eq('user_id', user.id)
              .eq('content_id', contentId)
          } else {
            void supabase.from('saves').insert({
              user_id: user.id,
              content_id: contentId,
              restaurant_id: null,
            })
          }
        }
      },

      toggleSaveRestaurant: (restaurantId) => {
        const { user, savedRestaurantIds } = get()
        const isSaved = savedRestaurantIds.includes(restaurantId)
        set({
          savedRestaurantIds: isSaved
            ? savedRestaurantIds.filter((id) => id !== restaurantId)
            : [...savedRestaurantIds, restaurantId],
        })
        if (user && UUID_RE.test(user.id)) {
          if (isSaved) {
            void supabase
              .from('saves')
              .delete()
              .eq('user_id', user.id)
              .eq('restaurant_id', restaurantId)
              .is('content_id', null)
          } else {
            void supabase.from('saves').insert({
              user_id: user.id,
              restaurant_id: restaurantId,
              content_id: null,
            })
          }
        }
      },

      syncSavesFromRemote: async () => {
        const { user } = get()
        if (!user || !UUID_RE.test(user.id)) return
        const { data, error } = await supabase
          .from('saves')
          .select('content_id, restaurant_id')
          .eq('user_id', user.id)
        if (error || !data) return
        const contentIds = data
          .map((r) => r.content_id)
          .filter((id): id is string => !!id)
        const restaurantIds = data
          .map((r) => r.restaurant_id)
          .filter((id): id is string => !!id)
        set((state) => ({
          savedContentIds: Array.from(new Set([...state.savedContentIds, ...contentIds])),
          savedRestaurantIds: Array.from(
            new Set([...state.savedRestaurantIds, ...restaurantIds])
          ),
        }))
      },
    }),
    {
      name: 'phx-foodie-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        savedContentIds: state.savedContentIds,
        savedRestaurantIds: state.savedRestaurantIds,
      }),
    }
  )
)
