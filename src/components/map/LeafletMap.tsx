'use client'

import { useEffect, useRef } from 'react'
import type { Restaurant } from '@/types'
import { DEFAULT_CENTER } from '@/lib/constants'

// We import leaflet dynamically in useEffect to avoid SSR issues
interface LeafletMapProps {
  restaurants: Restaurant[]
  selectedRestaurant: Restaurant | null
  onPinTap: (restaurant: Restaurant) => void
}

export default function LeafletMap({ restaurants, selectedRestaurant, onPinTap }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamic import of leaflet
    import('leaflet').then((L) => {
      // Fix default icon paths (webpack issue)
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

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map)

      // Zoom control on the right
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers when restaurants change
  useEffect(() => {
    if (!mapInstanceRef.current) return

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      restaurants.forEach((restaurant) => {
        const isSelected = selectedRestaurant?.id === restaurant.id

        // Custom icon with amber accent
        const icon = L.divIcon({
          className: 'custom-pin',
          html: `<div style="
            width: ${isSelected ? '40px' : '32px'};
            height: ${isSelected ? '40px' : '32px'};
            border-radius: 50% 50% 50% 0;
            background: ${isSelected ? '#F59E0B' : 'linear-gradient(135deg, #F59E0B, #EA580C)'};
            transform: rotate(-45deg);
            border: 2px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.3)'};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            transition: all 150ms ease;
          ">
            <span style="
              transform: rotate(45deg);
              font-weight: 700;
              font-size: ${isSelected ? '14px' : '12px'};
              color: ${isSelected ? '#000' : '#fff'};
            ">${restaurant.name[0]}</span>
          </div>`,
          iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
          iconAnchor: [isSelected ? 20 : 16, isSelected ? 40 : 32],
        })

        const marker = L.marker([restaurant.latitude, restaurant.longitude], { icon })
          .addTo(map)
          .on('click', () => onPinTap(restaurant))

        markersRef.current.push(marker)
      })
    })
  }, [restaurants, selectedRestaurant, onPinTap])

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
