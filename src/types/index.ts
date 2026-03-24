// Cuisine types - from Supabase DB
export type CuisineType = string

// Vibe tags - from Supabase DB
export type VibeTag = string

// Neighborhood type
export type Neighborhood = string;

// Price range 1-4
export type PriceRange = 1 | 2 | 3 | 4;

// Restaurant type
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine_types: CuisineType[];
  vibe_tags: VibeTag[];
  neighborhood: Neighborhood;
  address: string;
  latitude: number;
  longitude: number;
  price_range: PriceRange;
  phone: string;
  website: string;
  menu_url: string;
  hours: Record<string, Array<{ open: string; close: string }> | null>;
  booking_url: string;
  delivery_url: string;
  instagram_handle: string;
  tiktok_handle: string;
  google_place_id: string;
  is_active: boolean;
  created_at: string;
  subscription_tier: string;
  // Amendment 4/5: computed columns from trigger (optional — DB defaults)
  creator_count?: number;
  content_count?: number;
  is_surfaced?: boolean;
}

// Creator type
export interface Creator {
  id: string;
  display_name: string;
  slug: string;
  instagram_handle: string;
  tiktok_handle: string;
  instagram_followers: number;
  tiktok_followers: number;
  bio: string;
  avatar_url: string;
  tier: string;
  specialties: CuisineType[];
  areas_covered: Neighborhood[];
  rate_range_low: number;
  rate_range_high: number;
  is_founding_creator: boolean;
  is_active: boolean;
  platform_fee_rate: number;
  content_rights_status: string;
  created_at: string;
}

// Content sponsorship and rights types
export type SponsorshipStatus = 'organic' | 'comped' | 'sponsored' | 'platform_booked';
export type ContentType = 'video' | 'photo';
export type DisclosureStatus = string;
export type RightsStatus = boolean;

// Content type
export interface Content {
  id: string;
  creator_id: string;
  restaurant_id: string;
  content_type: ContentType;
  media_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  aspect_ratio: string;
  original_platform: string;
  original_url: string;
  caption: string;
  cuisine_tags: CuisineType[];
  vibe_tags: VibeTag[];
  sponsorship_status: SponsorshipStatus;
  disclosure_status: DisclosureStatus;
  rights_platform_display: RightsStatus;
  rights_platform_reshare: RightsStatus;
  rights_restaurant_repost: RightsStatus;
  rights_paid_amplification: RightsStatus;
  rights_duration: number;
  rights_expiry_date: string;
  publish_date: string;
  created_at: string;
  is_active: boolean;
  view_count: number;
  save_count: number;
  tap_count: number;
}

// Dish type
export interface Dish {
  id: string;
  restaurant_id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description: string;
  thumbnail_url: string;
  feature_count: number;
  created_at: string;
}

// ContentDish junction type
export interface ContentDish {
  content_id: string;
  dish_id: string;
  is_primary: boolean;
}

// User type
export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  default_area: Neighborhood;
  preferred_cuisines: CuisineType[];
  preferred_vibes: VibeTag[];
  onboarding_completed: boolean;
  created_at: string;
  // Amendment 9: engagement tracking
  last_app_open?: string | null;
}

// Save (collection item) type
export interface Save {
  user_id: string;
  content_id: string;
  restaurant_id: string;
  collection_name: string;
  created_at: string;
  // Amendment 10: push notification trigger
  last_action_at?: string | null;
}

// Event types (expanded per amendments)
export type EventType =
  | 'view' | 'save'
  | 'tap_restaurant' | 'tap_book' | 'tap_directions' | 'tap_call'
  | 'tap_order' | 'tap_menu' | 'tap_dish'
  | 'share';

export type TimeOfDayBucket = 'morning' | 'lunch' | 'afternoon' | 'evening' | 'late_night';

// Analytics event type
export interface AnalyticsEvent {
  id: string;
  user_id: string;
  content_id: string;
  restaurant_id: string;
  creator_id: string;
  event_type: EventType | string;
  source_screen: string;
  // Amendment 2/12: dish-level + time tracking
  dish_id?: string | null;
  time_of_day_bucket?: TimeOfDayBucket | null;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  created_at: string;
}

// Composed types
export interface ContentWithRelations extends Content {
  creator: Creator;
  restaurant: Restaurant;
}

export interface RestaurantWithContent extends Restaurant {
  content: Content[];
}
