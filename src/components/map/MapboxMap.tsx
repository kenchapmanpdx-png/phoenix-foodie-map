'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Restaurant } from '@/types'
import { DEFAULT_CENTER } from '@/lib/constants'

import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface MapboxMapProps {
  restaurants: Restaurant[]
  selectedRestaurant: Restaurant | null
  onPinTap: (restaurant: Restaurant) => void
}

// Cuisine-based gradient colors from blueprint RestaurantPin spec
function getGradientColors(cuisineType: string): [string, string] {
  const gradients: Record<string, [string, string]> = {
    Italian: ['#EF4444', '#DC2626'],
    Japanese: ['#EC4899', '#BE185D'],
    Mexican: ['#F59E0B', '#D97706'],
    Thai: ['#8B5CF6', '#6D28D9'],
    Indian: ['#F97316', '#C2410C'],
    Chinese: ['#EF4444', '#991B1B'],
    Vietnamese: ['#10B981', '#047857'],
    Korean: ['#F59E0B', '#EA580C'],
    Mediterranean: ['#3B82F6', '#1E40AF'],
    American: ['#64748B', '#334155'],
  }
  return gradients[cuisineType] || ['#F59E0B', '#D97706']
}

function createPinElement(
  restaurant: Restaurant,
  isSelected: boolean,
  index: number
): HTMLDivElement {
  const [color1, color2] = getGradientColors(restaurant.cuisine_types[0])
  const size = isSelected ? 44 : 36
  const staggerDelay = index * 40

  const container = document.createElement('div')
  container.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${color1}, ${color2});
    border: 2px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.3)'};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.5);
    cursor: pointer;
    position: relative;
    opacity: 0;
    transform: scale(0);
    animation: mapbox-pin-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: ${staggerDelay}ms;
    transition: transform 150ms ease, box-shadow 150ms ease;
  `

  const label = document.createElement('span')
  label.textContent = restaurant.name[0]
  label.style.cssText = `
    font-weight: 700;
    font-size: ${isSelected ? '16px' : '14px'};
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    line-height: 1;
  `
  container.appendChild(label)

  // Pulse ring for selected pin
  if (isSelected) {
    const pulse = document.createElement('div')
    pulse.style.cssText = `
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid ${color1};
      animation: mapbox-pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      pointer-events: none;
    `
    container.appendChild(pulse)
  }

  // Hover effects
  container.addEventListener('mouseenter', () => {
    container.style.transform = 'scale(1.15)'
    container.style.boxShadow = `0 4px 20px rgba(0,0,0,0.6), 0 0 12px ${color1}50`
  })
  container.addEventListener('mouseleave', () => {
    container.style.transform = 'scale(1)'
    container.style.boxShadow = '0 2px 12px rgba(0,0,0,0.5)'
  })

  return container
}

export default function MapboxMap({
  restaurants,
  selectedRestaurant,
  onPinTap,
}: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const styleInjectedRef = useRef(false)
  const [mapReady, setMapReady] = useState(false)

  // Inject CSS animations once
  useEffect(() => {
    if (styleInjectedRef.current) return
    styleInjectedRef.current = true

    const style = document.createElement('style')
    style.textContent = `
      @keyframes mapbox-pin-bounce {
        0% { transform: scale(0); opacity: 0; }
        70% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes mapbox-pulse-ring {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [DEFAULT_CENTER.longitude, DEFAULT_CENTER.latitude],
      zoom: 11,
      attributionControl: true,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

    mapRef.current = map

    map.on('load', () => {
      setMapReady(true)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers when restaurants or selection changes, or when map becomes ready
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    restaurants.forEach((restaurant, index) => {
      const isSelected = selectedRestaurant?.id === restaurant.id

      const el = createPinElement(restaurant, isSelected, index)

      el.addEventListener('click', (e) => {
        e.stopPropagation()

        // Native Mapbox flyTo per blueprint spec
        map.flyTo({
          center: [restaurant.longitude, restaurant.latitude],
          zoom: 14,
          duration: 800,
          easing: (t) => t * (2 - t), // ease-out quadratic
        })

        onPinTap(restaurant)
      })

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([restaurant.longitude, restaurant.latitude])
        .addTo(map)

      markersRef.current.push(marker)
    })
  }, [restaurants, selectedRestaurant, onPinTap, mapReady])

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ background: '#1a1a2e' }}
    />
  )
}
