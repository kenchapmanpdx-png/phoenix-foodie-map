// Curated Unsplash photography per cuisine, used as the canonical hero image
// whenever we need to represent a cuisine visually (Home Cravings grid,
// Onboarding cuisine selector, filter chips, etc.).
//
// Quality-selected, consistent dark food-photography aesthetic. 1200w is
// enough for a 2-col mobile grid; next/image downscales per device.

export const CUISINE_FALLBACK_IMAGES: Record<string, string> = {
  Mexican:
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=1200&q=80',
  American:
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80',
  Italian:
    'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1200&q=80',
  Asian:
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1200&q=80',
  Seafood:
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
  Pizza:
    'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1200&q=80',
  'BBQ/Comfort':
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  Brunch:
    'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80',
  Healthy:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
  'Dessert/Coffee':
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80',
  Italian_alt:
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80',
}

// Cuisine → emoji glyph. Used as a tiny personality marker on tiles and
// as the full fallback when no photo exists.
export const CUISINE_EMOJI: Record<string, string> = {
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
