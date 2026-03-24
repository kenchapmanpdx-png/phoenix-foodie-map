import type { CuisineType, VibeTag } from '@/types'

export const CUISINE_TYPES: Array<{ label: string; value: CuisineType; imagePath: string }> = [
  { label: 'Italian', value: 'Italian', imagePath: '/images/cuisines/italian.jpg' },
  { label: 'Japanese', value: 'Japanese', imagePath: '/images/cuisines/japanese.jpg' },
  { label: 'Mexican', value: 'Mexican', imagePath: '/images/cuisines/mexican.jpg' },
  { label: 'Thai', value: 'Thai', imagePath: '/images/cuisines/thai.jpg' },
  { label: 'Indian', value: 'Indian', imagePath: '/images/cuisines/indian.jpg' },
  { label: 'Chinese', value: 'Chinese', imagePath: '/images/cuisines/chinese.jpg' },
  { label: 'Vietnamese', value: 'Vietnamese', imagePath: '/images/cuisines/vietnamese.jpg' },
  { label: 'Korean', value: 'Korean', imagePath: '/images/cuisines/korean.jpg' },
  { label: 'Mediterranean', value: 'Mediterranean', imagePath: '/images/cuisines/mediterranean.jpg' },
  { label: 'American', value: 'American', imagePath: '/images/cuisines/american.jpg' },
]

export const VIBE_TAGS: Array<{ label: string; value: VibeTag }> = [
  { label: 'Casual', value: 'casual' },
  { label: 'Fine Dining', value: 'fine_dining' },
  { label: 'Trendy', value: 'trendy' },
  { label: 'Cozy', value: 'cozy' },
  { label: 'Romantic', value: 'romantic' },
  { label: 'Social', value: 'social' },
  { label: 'Healthy', value: 'healthy' },
  { label: 'Comfort Food', value: 'comfort_food' },
  { label: 'Upscale', value: 'upscale' },
  { label: 'Fast Casual', value: 'fast_casual' },
  { label: 'Family Friendly', value: 'family_friendly' },
  { label: 'Date Night', value: 'date_night' },
]

export const NEIGHBORHOODS = [
  'Downtown Phoenix',
  'Scottsdale',
  'Tempe',
  'Mesa',
  'Chandler',
  'Gilbert',
  'Ahwatukee',
  'Camelback',
  'Arcadia',
  'Paradise Valley',
  'Peoria',
  'Glendale',
  'Goodyear',
  'Surprise',
]

export const DEFAULT_CENTER = {
  latitude: 33.4484,
  longitude: -112.0740,
} as const
