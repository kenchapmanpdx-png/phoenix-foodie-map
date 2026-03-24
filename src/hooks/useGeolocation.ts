'use client'

import { useState, useEffect } from 'react'

interface GeoPosition {
  latitude: number
  longitude: number
}

interface GeolocationState {
  position: GeoPosition | null
  error: string | null
  loading: boolean
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

export function useGeolocation(): GeolocationState & { fallbackUsed: boolean } {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: true,
  })
  const [fallbackUsed, setFallbackUsed] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ position: PHOENIX_CENTER, error: 'Geolocation not supported', loading: false })
      setFallbackUsed(true)
      return
    }

    const timeoutId = setTimeout(() => {
      // If geolocation takes too long, fall back to Phoenix center
      setState((prev) => {
        if (prev.loading) {
          setFallbackUsed(true)
          return { position: PHOENIX_CENTER, error: 'timeout', loading: false }
        }
        return prev
      })
    }, 5000)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId)
        setState({
          position: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          error: null,
          loading: false,
        })
      },
      (err) => {
        clearTimeout(timeoutId)
        setState({ position: PHOENIX_CENTER, error: err.message, loading: false })
        setFallbackUsed(true)
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 300000 }
    )

    return () => clearTimeout(timeoutId)
  }, [])

  return { ...state, fallbackUsed }
}
