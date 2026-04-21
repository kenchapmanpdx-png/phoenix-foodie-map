'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

interface GeoPosition {
  latitude: number
  longitude: number
}

interface GeolocationState {
  position: GeoPosition | null
  error: string | null
  loading: boolean
  fallbackUsed: boolean
  /** Has a request been initiated? (singleton guard) */
  started: boolean
  start: () => void
}

// Haversine formula — returns distance in miles
export function getDistanceMiles(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Default center: Phoenix, AZ
const PHOENIX_CENTER: GeoPosition = { latitude: 33.4484, longitude: -112.074 }

export const useGeolocationStore = create<GeolocationState>((set, get) => ({
  position: null,
  error: null,
  loading: true,
  fallbackUsed: false,
  started: false,
  start: () => {
    if (get().started) return
    set({ started: true })

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      set({
        position: PHOENIX_CENTER,
        error: 'Geolocation not supported',
        loading: false,
        fallbackUsed: true,
      })
      return
    }

    const timeoutId = setTimeout(() => {
      if (get().loading) {
        set({
          position: PHOENIX_CENTER,
          error: 'timeout',
          loading: false,
          fallbackUsed: true,
        })
      }
    }, 5000)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId)
        set({
          position: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          error: null,
          loading: false,
          fallbackUsed: false,
        })
      },
      (err) => {
        clearTimeout(timeoutId)
        set({
          position: PHOENIX_CENTER,
          error: err.message,
          loading: false,
          fallbackUsed: true,
        })
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 300000 }
    )
  },
}))

/**
 * Subscribes to the singleton geolocation store, kicking off the one
 * navigator request on first mount. Safe to call from N components — only
 * one network/permission prompt runs for the lifetime of the page.
 */
export function useGeolocation() {
  const position = useGeolocationStore((s) => s.position)
  const error = useGeolocationStore((s) => s.error)
  const loading = useGeolocationStore((s) => s.loading)
  const fallbackUsed = useGeolocationStore((s) => s.fallbackUsed)
  const start = useGeolocationStore((s) => s.start)

  useEffect(() => {
    start()
  }, [start])

  return { position, error, loading, fallbackUsed }
}
