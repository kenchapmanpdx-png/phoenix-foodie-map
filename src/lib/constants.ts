export const CUISINE_TYPES: Array<{ label: string; value: string; imagePath: string }> = [
  { label: 'Mexican', value: 'Mexican', imagePath: '/images/cuisines/mexican.jpg' },
  { label: 'American', value: 'American', imagePath: '/images/cuisines/american.jpg' },
  { label: 'Italian', value: 'Italian', imagePath: '/images/cuisines/italian.jpg' },
  { label: 'Asian', value: 'Asian', imagePath: '/images/cuisines/asian.jpg' },
  { label: 'Seafood', value: 'Seafood', imagePath: '/images/cuisines/seafood.jpg' },
  { label: 'Pizza', value: 'Pizza', imagePath: '/images/cuisines/pizza.jpg' },
  { label: 'BBQ/Comfort', value: 'BBQ/Comfort', imagePath: '/images/cuisines/bbq.jpg' },
  { label: 'Brunch', value: 'Brunch', imagePath: '/images/cuisines/brunch.jpg' },
  { label: 'Healthy', value: 'Healthy', imagePath: '/images/cuisines/healthy.jpg' },
  { label: 'Dessert/Coffee', value: 'Dessert/Coffee', imagePath: '/images/cuisines/dessert.jpg' },
]

export const VIBE_TAGS: Array<{ label: string; value: string }> = [
  { label: 'Date Night', value: 'Date Night' },
  { label: 'Trendy / New', value: 'Trendy / New' },
  { label: 'Hidden Gem', value: 'Hidden Gem' },
  { label: 'Happy Hour', value: 'Happy Hour' },
  { label: 'Family', value: 'Family' },
  { label: 'Group Dinner', value: 'Group Dinner' },
  { label: 'Patio', value: 'Patio' },
  { label: 'Brunch', value: 'Brunch' },
  { label: 'Late Night', value: 'Late Night' },
  { label: 'Quick Bite', value: 'Quick Bite' },
  { label: 'Solo-Friendly', value: 'Solo-Friendly' },
  { label: 'Splurge-Worthy', value: 'Splurge-Worthy' },
]

export const NEIGHBORHOODS = [
  'Downtown Phoenix',
  'Central Phoenix',
  'Scottsdale',
  'Old Town Scottsdale',
  'North Scottsdale',
  'Tempe',
  'Mesa',
  'Gilbert',
  'Arcadia',
  'Cave Creek',
  'Peoria',
]

export const DEFAULT_CENTER = {
  latitude: 33.4484,
  longitude: -112.0740,
} as const
