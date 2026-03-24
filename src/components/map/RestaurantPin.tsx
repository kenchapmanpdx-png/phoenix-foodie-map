'use client'

import { useState } from 'react'
import type { Restaurant } from '@/types'

interface RestaurantPinProps {
  restaurant: Restaurant
  isSelected: boolean
  onClick: () => void
  animationDelay: number
}

export default function RestaurantPin({
  restaurant,
  isSelected,
  onClick,
  animationDelay,
}: RestaurantPinProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative"
      style={{
        animation: `pin-scale-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <style>{`
        @keyframes pin-scale-bounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          70% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {/* Pin circle with gradient */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
          isSelected
            ? 'ring-2 ring-[var(--color-accent-primary)] ring-offset-2 ring-offset-[var(--color-surface-primary)]'
            : ''
        } ${
          isHovered
            ? 'shadow-lg shadow-[var(--color-accent-primary)]/50 scale-110'
            : 'shadow-md'
        } hover:shadow-lg active:scale-95`}
        style={{
          background: `linear-gradient(135deg, ${getGradientColors(restaurant.cuisine_types[0])[0]}, ${getGradientColors(restaurant.cuisine_types[0])[1]})`,
        }}
      >
        {/* Restaurant initial or icon */}
        <div className="text-white font-bold text-lg">
          {restaurant.name[0]}
        </div>

        {/* Tooltip on hover */}
        {(isHovered || isSelected) && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-[var(--color-surface-card)] text-[var(--color-text-primary)] text-xs font-medium rounded-lg whitespace-nowrap shadow-lg z-50 border border-white/10">
            {restaurant.name}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[var(--color-surface-card)] border-r border-b border-white/10 rotate-45" />
          </div>
        )}

        {/* Active pulse effect */}
        {isSelected && (
          <div
            className="absolute inset-0 rounded-full border-2 border-[var(--color-accent-primary)]"
            style={{
              animation: 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
      </button>

      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

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
