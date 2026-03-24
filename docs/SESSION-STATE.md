# Session State: Phase 4 - Attribution & Event Tracking

## Completed

### Core Analytics System
- `/src/lib/analytics.ts`: Event tracking engine with in-memory MVP store
  - `trackEvent()`: Main function to capture user actions
  - `getEventsByRestaurant()`, `getEventsByCreator()`, `getEventsByContent()`: Query helpers
  - `calculateMetrics()`: Aggregate performance metrics (views, saves, taps, visits, cost-per-action)
  - Event types: view, save, tap_restaurant, tap_book, tap_directions, tap_call, tap_order, tap_menu, share

### UTM Attribution System
- `/src/lib/utm.ts`: URL parameter building and parsing
  - `buildOutboundUrl()`: Adds UTM params to outbound links (booking, directions, delivery, menu, call)
  - `parseUTMParams()`: Extract UTM from URLs
  - `getUTMParamsFromLocation()`: Get current window UTM params
  - UTM structure: source=phoenixfoodiemap, medium=creator_content, campaign=[restaurant], content=[content_id], term=[creator]

### Custom Hooks
- `/src/hooks/useTrackEvent.ts`: Wraps trackEvent with auto source_screen from pathname
- `/src/hooks/useTrackView.ts`: IntersectionObserver-based view tracking (50% threshold, one-shot)

### UI Components
- `/src/components/shared/TrackedLink.tsx`: Link wrapper with automatic event tracking
  - Handles both internal and external links
  - Adds UTM params to external links
  - Tracks on click

### API Route
- `/src/app/api/events/route.ts`: REST endpoint for event logging
  - POST: Accept and log events (MVP uses in-memory, comments for Supabase)
  - GET: Query events with filtering (restaurant_id, creator_id, content_id, date range)
  - Optional metrics calculation on retrieval

### Database Schema
- `/src/lib/supabase-schema.sql`: Complete PostgreSQL schema with RLS policies
  - Tables: restaurants, creators, content, dishes, content_dishes, users, saves, events
  - Constraints: saves must have exactly one of content_id OR restaurant_id (check constraint)
  - Indexes on: restaurant_id, creator_id, event_type (events), content timestamps
  - RLS policies for public read (active items), user-scoped writes (saves), anonymous event insert

## Architecture Notes

### Event Flow
1. Component calls `useTrackEvent()` hook or uses `<TrackedLink>` component
2. Event captured with: event_type, content_id, restaurant_id, creator_id, source_screen, UTM params
3. MVP: stored in in-memory array in `analytics.ts`
4. Production: insert into Supabase `events` table (commented in code)
5. Analytics dashboard queries events via `/api/events` with filters

### Attribution Model
- **UTM Source**: phoenixfoodiemap (platform identifier)
- **UTM Medium**: creator_content (content type)
- **UTM Campaign**: restaurant slug (which restaurant)
- **UTM Content**: content_id (which creator content)
- **UTM Term**: creator slug (which creator)

This enables tracking: which restaurants drive clicks, which creators are effective, which content converts best.

### Metrics Calculation
- **views**: 'view' events
- **saves**: 'save' events
- **bookingTaps, directionTaps, callTaps, orderTaps, menuTaps, shares**: action-specific events
- **estimatedVisits**: unique user count (simple session metric)
- **costPerAction**: $0.10 per engagement action (configurable for pricing model)

## Integration Checklist

- [ ] Add event tracking to content cards (useTrackView ref)
- [ ] Add event tracking to action buttons (useTrackEvent + TrackedLink)
- [ ] Add UTM params to all outbound links (booking, directions, delivery, menu, phone)
- [ ] Create analytics dashboard to display metrics
- [ ] Set up Supabase schema in production
- [ ] Update environment variables for Supabase connection
- [ ] Test event logging with browser devtools
- [ ] Test UTM param propagation on external links
- [ ] Create metrics aggregation endpoints for restaurant/creator dashboards
- [ ] Add event retention policy (e.g., delete events older than 2 years)

### Supabase Database Seeded (2026-03-23)
- Seed script: `scripts/seed.sql` (68KB, 118 statements)
- Execution: Direct API calls via Supabase Management API (`api.supabase.com/v1/projects/{id}/database/query`)
- Method: Node.js script split SQL into 24 batches of 5 statements each, all returned 201
- Row counts verified:
  - restaurants: 30
  - creators: 5
  - content: 35
  - dishes: 20
  - content_dishes: 22
- Seed data source: `phoenix_foodie_map_seed_data.json` (uploaded by user)
- UUID generation: deterministic v5 UUIDs from string IDs (e.g., `rest_001` → `39d6a76c-...`)
- Note: Unsplash thumbnail URLs used for dev; replace with Supabase Storage or Cloudflare Images for production

### Mapbox GL JS (previous session)
- Replaced Leaflet with Mapbox GL JS per blueprint spec
- Dark style: `mapbox://styles/mapbox/dark-v11`
- Custom pin elements with cuisine-based gradient colors
- Pin entrance animations (staggered bounce)
- flyTo on pin click (zoom 14, 800ms ease-out)
- Mini card slide-up with touch drag dismiss

## Completed: Full Supabase Wiring + Pin Tap Fix (2026-03-23)

All 20 consumer/dashboard/creator components wired to Supabase. Map switched from Mapbox to Leaflet (Mapbox CSS fails on Vercel). 30 pins verified on live site. Pin tap → flyTo → MiniCard fixed (z-index + outside-click race condition).

## Completed: P0/P1 Bug Fixes (2026-03-24)

Applied via patch (`dc129ea`):
- Analytics events persist to Supabase (was in-memory only)
- Consolidated duplicate UTM builders (deleted buildUTMUrl from utils.ts)
- Fixed RestaurantDetailScreen day name case (Sunday→sunday) for hours display
- FeedCard/VideoCard save state uses Zustand store (was local useState)
- FTC disclosure labels: "Comped"→"Gifted", "Platform Booked"→"Sponsored"
- DB migrations applied: content_dishes RLS enabled, platform_fee_rate default 5%

## Completed: P2/P3 Sprint (2026-03-24)

Commit `b6e3d7a`:
- **Geolocation + Haversine distance**: `useGeolocation` hook with browser API, 5s fallback to Phoenix center. Replaces Math.random() and Pythagorean distance everywhere.
- **Dish→content filtering**: Tap dish on restaurant detail to filter content via content_dishes junction. New `fetchContentDishLinks` query + `useContentDishLinks` hook.
- **Open Now filter**: MapScreen filtering now checks `activeFilters.openNow` against `isOpenNow()`.
- **Route fix**: `/restaurant/[slug]` and `/content/[id]` 404 on Vercel fixed — Next.js 15+ requires `await params`.
- **Skeleton loading**: FeedCardSkeleton shimmer during Supabase load. Map suppresses "No restaurants found" during loading.
- **Back button fix**: Restaurant detail uses `history.back()` instead of hardcoded `/feed` link.

## Next Steps

1. **Video playback** (#7): Implement `<video>` with IntersectionObserver autoplay, muted+playsinline, 3-loop pause
2. **Saves persistence** (#9): Write saves to Supabase `saves` table, sync on load
3. **View Transitions** (#14): `next-view-transitions` for card→detail shared element transitions
4. **Skeleton loading expansion**: Add to restaurant detail, search, saved screens
5. **Pagination/infinite scroll** (#16): Cursor-based content loading for scale
6. **Image hosting**: Migrate Unsplash URLs to Supabase Storage or Cloudflare Images
7. **PWA manifest + service worker** (#22): Workbox caching, install prompt
8. **Counter-offer flow** (#6): Creator gig negotiation UI
