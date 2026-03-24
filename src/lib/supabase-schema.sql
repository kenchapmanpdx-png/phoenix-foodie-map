-- Phoenix Foodie Map Supabase Schema
-- Core tables for restaurants, creators, content, and analytics

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "ltree";

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  cuisine_types TEXT[] NOT NULL DEFAULT '{}',
  vibe_tags TEXT[] NOT NULL DEFAULT '{}',
  neighborhood VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  price_range INTEGER NOT NULL CHECK (price_range >= 1 AND price_range <= 4),
  phone VARCHAR(20),
  website VARCHAR(255),
  menu_url VARCHAR(255),
  hours JSONB NOT NULL DEFAULT '{}',
  booking_url VARCHAR(255),
  delivery_url VARCHAR(255),
  instagram_handle VARCHAR(255),
  tiktok_handle VARCHAR(255),
  google_place_id VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_neighborhood ON restaurants(neighborhood);
CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);

-- Creators table
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  instagram_handle VARCHAR(255),
  tiktok_handle VARCHAR(255),
  instagram_followers INTEGER DEFAULT 0,
  tiktok_followers INTEGER DEFAULT 0,
  bio TEXT,
  avatar_url VARCHAR(255),
  tier VARCHAR(50) DEFAULT 'free',
  specialties TEXT[] DEFAULT '{}',
  areas_covered TEXT[] DEFAULT '{}',
  rate_range_low INTEGER DEFAULT 0,
  rate_range_high INTEGER DEFAULT 0,
  is_founding_creator BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  platform_fee_rate DECIMAL(5, 2) DEFAULT 5.00,
  content_rights_status VARCHAR(50) DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_creators_slug ON creators(slug);
CREATE INDEX idx_creators_is_active ON creators(is_active);
CREATE INDEX idx_creators_specialties ON creators USING GIN(specialties);

-- Content table
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'photo')),
  media_url VARCHAR(255) NOT NULL,
  thumbnail_url VARCHAR(255),
  duration_seconds INTEGER DEFAULT 0,
  aspect_ratio VARCHAR(20),
  original_platform VARCHAR(50),
  original_url VARCHAR(255),
  caption TEXT,
  cuisine_tags TEXT[] DEFAULT '{}',
  vibe_tags TEXT[] DEFAULT '{}',
  sponsorship_status VARCHAR(50) DEFAULT 'organic' CHECK (sponsorship_status IN ('organic', 'comped', 'sponsored', 'platform_booked')),
  disclosure_status VARCHAR(50),
  rights_platform_display BOOLEAN DEFAULT TRUE,
  rights_platform_reshare BOOLEAN DEFAULT FALSE,
  rights_restaurant_repost BOOLEAN DEFAULT FALSE,
  rights_paid_amplification BOOLEAN DEFAULT FALSE,
  rights_duration INTEGER DEFAULT 365,
  rights_expiry_date DATE,
  publish_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  tap_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_creator_id ON content(creator_id);
CREATE INDEX idx_content_restaurant_id ON content(restaurant_id);
CREATE INDEX idx_content_is_active ON content(is_active);
CREATE INDEX idx_content_created_at ON content(created_at);
CREATE INDEX idx_content_sponsorship ON content(sponsorship_status);

-- Dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10, 2) DEFAULT 0,
  description TEXT,
  thumbnail_url VARCHAR(255),
  feature_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, slug)
);

CREATE INDEX idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX idx_dishes_category ON dishes(category);

-- Content-Dishes junction table
CREATE TABLE IF NOT EXISTS content_dishes (
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (content_id, dish_id)
);

CREATE INDEX idx_content_dishes_dish_id ON content_dishes(dish_id);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  avatar_url VARCHAR(255),
  default_area VARCHAR(255),
  preferred_cuisines TEXT[] DEFAULT '{}',
  preferred_vibes TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Saves (collections) table
CREATE TABLE IF NOT EXISTS saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  collection_name VARCHAR(255) DEFAULT 'Saved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT saves_has_one_reference CHECK (
    (content_id IS NOT NULL AND restaurant_id IS NULL) OR
    (content_id IS NULL AND restaurant_id IS NOT NULL)
  )
);

CREATE INDEX idx_saves_user_id ON saves(user_id);
CREATE INDEX idx_saves_content_id ON saves(content_id);
CREATE INDEX idx_saves_restaurant_id ON saves(restaurant_id);
CREATE INDEX idx_saves_collection_name ON saves(collection_name);

-- Analytics Events table
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL DEFAULT 'anonymous',
  content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'save', 'tap_restaurant', 'tap_book', 'tap_directions', 'tap_call', 'tap_order', 'tap_menu', 'share')),
  source_screen VARCHAR(255) NOT NULL,
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_content VARCHAR(255),
  utm_term VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_restaurant_id ON events(restaurant_id);
CREATE INDEX idx_events_creator_id ON events(creator_id);
CREATE INDEX idx_events_content_id ON events(content_id);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_source_screen ON events(source_screen);

-- Row Level Security (RLS) Policies
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active restaurants
CREATE POLICY "restaurants_public_read" ON restaurants
  FOR SELECT USING (is_active = TRUE);

-- Allow public read access to active creators
CREATE POLICY "creators_public_read" ON creators
  FOR SELECT USING (is_active = TRUE);

-- Allow public read access to active content
CREATE POLICY "content_public_read" ON content
  FOR SELECT USING (is_active = TRUE);

-- Allow public read access to dishes
CREATE POLICY "dishes_public_read" ON dishes
  FOR SELECT USING (TRUE);

-- Allow public read access to content-dish junctions
CREATE POLICY "content_dishes_public_read" ON content_dishes
  FOR SELECT USING (TRUE);

-- Allow users to read their own data
CREATE POLICY "users_self_read" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "users_self_update" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to read their own saves
CREATE POLICY "saves_user_read" ON saves
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own saves
CREATE POLICY "saves_user_insert" ON saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own saves
CREATE POLICY "saves_user_delete" ON saves
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public to insert events (anonymous tracking)
CREATE POLICY "events_public_insert" ON events
  FOR INSERT WITH CHECK (TRUE);

-- Allow public to read own events
CREATE POLICY "events_user_read" ON events
  FOR SELECT USING (user_id = COALESCE(auth.uid()::TEXT, 'anonymous'));
