'use client'

import { useEffect, useRef, useState } from 'react'
import type { Restaurant } from '@/types'
import { DEFAULT_CENTER } from '@/lib/constants'

interface LeafletMapProps {
  restaurants: Restaurant[]
  selectedRestaurant: Restaurant | null
  onPinTap: (restaurant: Restaurant) => void
}

// Cuisine-based gradient colors matching RestaurantPin blueprint
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
      @keyframes pin-scale-bounce {
        0% { transform: scale(0); opacity: 0; }
        70% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
      .leaflet-pin-enter {
        animation: pin-scale-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        opacity: 0;
      }
      .leaflet-pin-selected::after {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2px solid #F59E0B;
        animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
      const [color1, color2] = getGradientColors(restaurant.cuisine_types[0])
      const staggerDelay = index * 40
      const size = isSelected ? 44 : 36

      const icon = L.divIcon({
        className: 'custom-pin',
        html: `<div class="leaflet-pin-enter ${isSelected ? 'leaflet-pin-selected' : ''}" style="
          position: relative;
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
          animation-delay: ${staggerDelay}ms;
          transition: transform 150ms ease, box-shadow 150ms ease;
        ">
          <span style="
            font-weight: 700;
            font-size: ${isSelected ? '16px' : '14px'};
            color: #fff;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          ">${restaurant.name[0]}</span>
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
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
