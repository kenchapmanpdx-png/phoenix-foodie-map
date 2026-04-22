'use client'

import { useEffect, useRef, useState } from 'react'
import type { Restaurant } from '@/types'
import { DEFAULT_CENTER } from '@/lib/constants'
import { isOpenNow } from '@/lib/utils'

interface LeafletMapProps {
  restaurants: Restaurant[]
  selectedRestaurant: Restaurant | null
  onPinTap: (restaurant: Restaurant) => void
}

// Cuisine → emoji. Matches RestaurantPin blueprint for consistency.
const CUISINE_EMOJI: Record<string, string> = {
  Italian: '🍝',
  Japanese: '🍱',
  Mexican: '🌮',
  Thai: '🥘',
  Indian: '🍛',
  Chinese: '🥡',
  Vietnamese: '🍲',
  Korean: '🍜',
  Mediterranean: '🫒',
  American: '🍔',
  Pizza: '🍕',
  Seafood: '🦞',
  'BBQ/Comfort': '🍖',
  Brunch: '🥞',
  Healthy: '🥗',
  'Dessert/Coffee': '☕',
  Asian: '🥢',
}

function getGradientColors(cuisineType: string): [string, string] {
  const gradients: Record<string, [string, string]> = {
    Italian: ['#EF4444', '#B91C1C'],
    Japanese: ['#EC4899', '#9D174D'],
    Mexican: ['#F59E0B', '#B45309'],
    Thai: ['#8B5CF6', '#5B21B6'],
    Indian: ['#F97316', '#9A3412'],
    Chinese: ['#DC2626', '#7F1D1D'],
    Vietnamese: ['#10B981', '#065F46'],
    Korean: ['#F59E0B', '#C2410C'],
    Mediterranean: ['#3B82F6', '#1E3A8A'],
    American: ['#64748B', '#1E293B'],
    Pizza: ['#EF4444', '#991B1B'],
    Seafood: ['#06B6D4', '#0E7490'],
    'BBQ/Comfort': ['#B45309', '#78350F'],
    Brunch: ['#F59E0B', '#D97706'],
    Healthy: ['#22C55E', '#15803D'],
    'Dessert/Coffee': ['#A855F7', '#6B21A8'],
    Asian: ['#EF4444', '#991B1B'],
  }
  return gradients[cuisineType] || ['#F59E0B', '#B45309']
}

export default function LeafletMap({ restaurants, selectedRestaurant, onPinTap }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const leafletRef = useRef<any>(null)
  const styleInjectedRef = useRef(false)
  const [mapReady, setMapReady] = useState(false)

  // Inject pin animation CSS once
  useEffect(() => {
    if (styleInjectedRef.current) return
    styleInjectedRef.current = true

    const style = document.createElement('style')
    style.textContent = `
      @keyframes pfm-pin-drop {
        0%   { transform: translateY(-14px) scale(0.4); opacity: 0; }
        70%  { transform: translateY(2px) scale(1.08); opacity: 1; }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }
      @keyframes pfm-pin-pulse {
        0%   { transform: scale(1); opacity: 0.9; }
        100% { transform: scale(1.9); opacity: 0; }
      }
      .pfm-pin {
        position: relative;
        transform-origin: bottom center;
        animation: pfm-pin-drop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        opacity: 0;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.55));
        transition: transform 160ms ease;
        cursor: pointer;
      }
      .pfm-pin:hover,
      .pfm-pin.is-selected {
        transform: translateY(-2px) scale(1.08);
      }
      .pfm-pin .pfm-emoji {
        position: absolute;
        top: 7px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 17px;
        line-height: 1;
        user-select: none;
        pointer-events: none;
      }
      .pfm-pin .pfm-status {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 8px;
        height: 8px;
        border-radius: 9999px;
        box-shadow: 0 0 0 2px rgba(255,255,255,0.92);
      }
      .pfm-pin .pfm-status.open   { background: #10B981; }
      .pfm-pin .pfm-status.closed { background: #EF4444; }
      .pfm-pin.is-selected .pfm-ring {
        position: absolute;
        top: 6.5px;
        left: 50%;
        transform-origin: center;
        transform: translateX(-50%);
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        border: 2px solid rgba(255,255,255,0.85);
        animation: pfm-pin-pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        pointer-events: none;
      }
      .custom-pin { background: none !important; border: none !important; }
    `
    document.head.appendChild(style)
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then((L) => {
      if (!mapRef.current) return

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude],
        zoom: 11,
        zoomControl: false,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapInstanceRef.current = map
      leafletRef.current = L
      setMapReady(true)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        leafletRef.current = null
      }
    }
  }, [])

  // Update markers when restaurants change OR when map becomes ready
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = leafletRef.current
    if (!map || !L || !mapReady) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    restaurants.forEach((restaurant, index) => {
      const isSelected = selectedRestaurant?.id === restaurant.id
      const cuisine = restaurant.cuisine_types[0] || ''
      const [color1, color2] = getGradientColors(cuisine)
      const emoji = CUISINE_EMOJI[cuisine] || '🍽️'
      const open = isOpenNow(restaurant.hours)
      const staggerDelay = index * 30
      // SVG size (teardrop is 40x50)
      const w = 40
      const h = 50
      const gradId = `pfm-pin-${restaurant.id}`

      const html = `
        <div class="pfm-pin ${isSelected ? 'is-selected' : ''}" style="width:${w}px;height:${h}px;animation-delay:${staggerDelay}ms;">
          <svg width="${w}" height="${h}" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block">
            <defs>
              <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${color1}" />
                <stop offset="100%" stop-color="${color2}" />
              </linearGradient>
            </defs>
            <path d="M20 1.5a17 17 0 0 1 17 17c0 9.5-7.5 17.5-17 29.5-9.5-12-17-20-17-29.5a17 17 0 0 1 17-17z"
              fill="url(#${gradId})"
              stroke="${isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)'}"
              stroke-width="${isSelected ? 2 : 1}" />
            <circle cx="20" cy="18.5" r="12" fill="rgba(255,255,255,0.94)" />
          </svg>
          <span class="pfm-emoji">${emoji}</span>
          <span class="pfm-status ${open ? 'open' : 'closed'}"></span>
          ${isSelected ? '<span class="pfm-ring"></span>' : ''}
        </div>
      `

      const icon = L.divIcon({
        className: 'custom-pin',
        html,
        iconSize: [w, h],
        // Anchor at the tip of the teardrop (bottom center) so the pin
        // "points" at the actual coordinate rather than floating above it.
        iconAnchor: [w / 2, h - 2],
      })

      const marker = L.marker([restaurant.latitude, restaurant.longitude], { icon })
        .addTo(map)
        .on('click', () => {
          map.flyTo([restaurant.latitude, restaurant.longitude], 14, {
            duration: 0.8,
            easeLinearity: 0.25,
          })
          onPinTap(restaurant)
        })

      markersRef.current.push(marker)
    })
  }, [restaurants, selectedRestaurant, onPinTap, mapReady])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} className="w-full h-full" style={{ background: '#1a1a2e' }} />
    </>
  )
}
