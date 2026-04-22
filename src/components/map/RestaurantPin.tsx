'use client'

import { useState } from 'react'
import type { Restaurant } from '@/types'
import { isOpenNow } from '@/lib/utils'

interface RestaurantPinProps {
  restaurant: Restaurant
  isSelected: boolean
  onClick: () => void
  animationDelay: number
}

// Cuisine → emoji used as the pin's "personality" glyph. Falls back to 🍽️.
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

export default function RestaurantPin({
  restaurant,
  isSelected,
  onClick,
  animationDelay,
}: RestaurantPinProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [grads0, grads1] = getGradientColors(restaurant.cuisine_types[0])
  const emoji = CUISINE_EMOJI[restaurant.cuisine_types[0]] || '🍽️'
  const open = isOpenNow(restaurant.hours)

  return (
    <div
      className="relative"
      style={{
        animation: `pin-drop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        animationDelay: `${animationDelay}ms`,
        transformOrigin: 'bottom center',
      }}
    >
      <style>{`
        @keyframes pin-drop {
          0%   { transform: translateY(-14px) scale(0.4); opacity: 0; }
          70%  { transform: translateY(2px) scale(1.08); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pin-pulse-ring {
          0%   { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>

      {/* Drop shadow ellipse for depth */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-black/35 blur-sm pointer-events-none"
      />

      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={restaurant.name}
        className={`
          relative block
          transition-transform duration-200
          ${isHovered || isSelected ? 'scale-110 -translate-y-0.5' : 'scale-100'}
          active:scale-95
        `}
        style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.45))' }}
      >
        {/* Teardrop pin — SVG for crisp shape */}
        <svg
          width="40"
          height="50"
          viewBox="0 0 40 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block"
        >
          <defs>
            <linearGradient id={`pin-grad-${restaurant.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={grads0} />
              <stop offset="100%" stopColor={grads1} />
            </linearGradient>
          </defs>
          {/* Teardrop silhouette: circle head + tapered tail */}
          <path
            d="M20 1.5a17 17 0 0 1 17 17c0 9.5-7.5 17.5-17 29.5-9.5-12-17-20-17-29.5a17 17 0 0 1 17-17z"
            fill={`url(#pin-grad-${restaurant.id})`}
            stroke={isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)'}
            strokeWidth={isSelected ? 2 : 1}
          />
          {/* Inner white disc for emoji contrast */}
          <circle cx="20" cy="18.5" r="12" fill="rgba(255,255,255,0.94)" />
        </svg>

        {/* Emoji — positioned over the disc */}
        <span
          className="absolute top-[7px] left-1/2 -translate-x-1/2 text-[17px] leading-none select-none pointer-events-none"
          style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.1))' }}
        >
          {emoji}
        </span>

        {/* Open/closed dot */}
        <span
          className={`absolute top-[5px] right-[6px] w-2 h-2 rounded-full ring-2 ring-white/90 ${
            open ? 'bg-emerald-500' : 'bg-red-500'
          }`}
          aria-hidden
        />

        {/* Active pulse ring */}
        {isSelected && (
          <span
            className="absolute top-[6.5px] left-1/2 -translate-x-1/2 w-[28px] h-[28px] rounded-full border-2"
            style={{
              borderColor: grads0,
              animation: 'pin-pulse-ring 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
            aria-hidden
          />
        )}
      </button>

      {/* Tooltip on hover / active */}
      {(isHovered || isSelected) && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-[var(--color-surface-card)] text-[var(--color-text-primary)] text-xs font-semibold rounded-lg whitespace-nowrap shadow-lg z-50 border border-white/10 pointer-events-none">
          {restaurant.name}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[var(--color-surface-card)] border-r border-b border-white/10 rotate-45" />
        </div>
      )}
    </div>
  )
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
