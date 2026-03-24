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

## Completed: Restaurant Detail Dish-First Restructure (2026-03-24)

Commit `b42610e`:
- **Dish Catalog is now Section 1** (primary content, immediately below sticky action buttons)
- **DishCard component**: Thumbnail from highest-engagement content, dish name, price, stacked creator avatars (max 3 + overflow badge), "Featured by X creators" count
- **Horizontal scroll** for 4+ dishes (snap-x), vertical list for <4
- **Tap dish → mini-feed expansion**: Shows all linked reels with creator avatar, handle, caption, date. Tap reel → Content Detail
- **All Content grid** moved to Section 2: 3-column Instagram-style with creator avatar overlay (bottom-left) on each thumbnail, video play indicator (top-right)
- **Sticky action buttons**: Book, Delivery, Directions, Menu, Call persist on scroll with backdrop blur
- **Skeleton loading**: Full-page RestaurantDetailSkeleton while Supabase data loads
- Data wiring: `contentDishLinks` junction → per-dish creator computation via `useMemo`, unique creators extracted from `ContentWithRelations.creator`
- Header consolidated: cuisine, neighborhood, price range in subtitle row below restaurant name
- Bookmark icon updated to proper bookmark SVG path

## Completed: Real Creator Seed Data Import (2026-03-24)

Wiped synthetic data and replaced with real Phoenix food creator content from Instagram.

- **Script**: `scripts/seed-real-data.mjs` (Supabase JS client with anon key)
- **Method**: Temporarily disabled RLS via Management API, ran seed script, re-enabled RLS
- **Raw data files**: `seed-data/raw-azfoodguy.json`, `raw-happiesthourarizona.json`, `raw-nopaidfoodreviews.json`, `raw-azfoodie.json`
- **Consolidated data**: `seed-data/real_seed_data.json`
- **Row counts verified**:
  - restaurants: 27
  - creators: 4 (@azfoodguy, @happiesthourarizona, @nopaidfoodreviews, @azfoodie)
  - content: 28
  - dishes: 59
  - content_dishes: 59
- **Smoke test passed**: Feed (28 cards, all 4 creators), Map (27 pins on Leaflet), Restaurant Detail (Din Tai Fung: 5 dishes, hours, dish-first layout), Search (Popular + New on the map sections)
- **Note**: Thumbnail URLs are placeholder; next step is capturing real reel thumbnails and creator avatars from Instagram

## Completed: Thumbnail Rendering Fix (2026-03-24)

Commits `42342fb`, `de2291c`, `c0f611c`:

- **Root cause 1**: `VideoCard.tsx` had no `<img>` tag for `thumbnail_url`/`media_url` — only a gradient placeholder with emoji. 25/28 content items are `content_type=video`, routing to VideoCard. Added `<img>` with `absolute inset-0 object-cover`.
- **Root cause 2**: `.feed-card` CSS class in `globals.css` sets `opacity: 0` (entrance animation). Both the outer `FeedCardWrapper` div AND inner card divs in `VideoCard`/`FeedCard` had this class. Only the outer wrapper gets `.in-view` from IntersectionObserver, so the inner card stayed `opacity: 0` forever. Removed `feed-card` class from inner card divs.
- **Unsplash placeholder images**: 28 content thumbnails (640x800 food photos mapped by cuisine) and 4 creator avatars (200x200 portraits) populated via Supabase Management API.
- **Verified on live site**: Feed cards show full-bleed food photos with creator avatars, restaurant names, Video badges, distance badges, and scrim overlays.

## Completed: Instagram Reel Linking (2026-03-24)

Commit `c2f2377`:

- **original_url populated**: All 28 content rows updated in Supabase with real Instagram reel/post permalinks (e.g. `https://www.instagram.com/azfoodguy/reel/DJAuG2XMdsI/`). Ran via Management API using browser auth context.
- **Play button wired**: VideoCard play button now calls `window.open(content.original_url, '_blank')` instead of just disappearing on hover. Clicking play opens the actual Instagram reel in a new tab.
- **Verified on live site**: Clicked play on Three Thirty Three card → opened @azfoodguy's reel on Instagram with 967 likes, correct restaurant.

## Completed: Amendment 6 & 3/4 Amendments (2026-03-24)

**RestaurantDetailScreen (Amendment 6)**:
- Enhanced dish display to function as menu: 5+ dishes show as horizontal menu, <5 show vertical
- Added `tap_dish` event tracking via `useTrackEvent` hook on dish card clicks
- Added empty state for unsurfaced restaurants: "More creator coverage coming soon — know a foodie who's been here? Share this page."
- View Menu button already secondary in styling (same class as Directions, Call)

**MapScreen (Amendment 3/4)**:
- Added `useSurfacedRestaurants` hook in `useSupabaseData.ts` to fetch only surfaced restaurants
- Updated MapScreen to use `useSurfacedRestaurants` instead of `useRestaurants`
- Implemented Open Now dimming (not hiding): When `openNow` filter active, closed restaurants show with `opacity-50 grayscale` classes
- Shows "Closed · [next opening time]" text for closed restaurants when openNow filter on
- Imported `getNextOpenTime` utility for next opening calculation

## Completed: All 12 Blueprint v2 Amendments (2026-03-24)

Commits `cba300f`, `6fbf6d2`, `81ea66f`:

**Foundation (types, queries, config)**:
- `types/index.ts`: Added `creator_count`, `content_count`, `is_surfaced` to Restaurant; `last_app_open` to User; `last_action_at` to Save; `dish_id`/`time_of_day_bucket` to AnalyticsEvent
- `lib/queries.ts`: `fetchSurfacedRestaurants()` (is_surfaced=true), `fetchTopDishes()`, `searchDishes()`
- `lib/utils.ts`: `getVibeTimeScore()`, `getNextOpenTime()`, `EVENT_WEIGHTS`, `getTimeOfDayBucket()`
- `store/filters.ts`: `openNow` defaults true 11am–midnight

**Amendment 1**: HomeScreen "Dishes People Are Ordering" section — top 8 dishes by feature_count
**Amendment 2**: FeedScreen time-of-day vibe ranking — primary sort by getVibeTimeScore, secondary by publish_date
**Amendment 3**: Open Now default + closed restaurant dimming (opacity-50 grayscale) on MapScreen
**Amendment 4**: is_surfaced filter — MapScreen uses useSurfacedRestaurants; direct URL access unfiltered
**Amendment 5**: Creator Pick badge — VideoCard, FeedCard, ContentCard show amber badge when creator_count >= 3
**Amendment 6**: RestaurantDetailScreen in-app menu (5+ dishes horizontal scroll) + tap_dish event tracking
**Amendment 7**: SearchScreen dish-priority results — dishes render first, "Most Featured Dishes" pre-search
**Amendment 8**: Removed urgency/scarcity messaging — "Trending Now"→"Recently Featured", sort→"Newest", GigManager urgency colors removed
**Amendment 9**: Email template infrastructure — weekly digest, monthly recap, 7d/30d win-back sequences (`lib/emailTemplates.ts`)
**Amendment 10**: Push notification triggers — new content for saved restaurants, save reminders, last_action_at tracking (`lib/pushNotifications.ts`)
**Amendment 11**: Restaurant dashboard Performance Benchmarks panel — views/content, save rate, action rate, creator content with category avg/top performer bars
**Amendment 12**: Behavioral taste profiling engine — weighted events, recency decay, taste vector, feed re-ranking with anti-filter-bubble randomness (`lib/tasteProfile.ts`)

## Next Steps

1. **Video playback** (#7): Implement `<video>` with IntersectionObserver autoplay, muted+playsinline, 3-loop pause
2. **Saves persistence** (#9): Write saves to Supabase `saves` table, sync on load
3. **View Transitions** (#14): `next-view-transitions` for card→detail shared element transitions
4. **Skeleton loading expansion**: Add to restaurant detail, search, saved screens
5. **Pagination/infinite scroll** (#16): Cursor-based content loading for scale
6. **Image hosting**: Migrate Unsplash URLs to Supabase Storage or Cloudflare Images
7. **PWA manifest + service worker** (#22): Workbox caching, install prompt
8. **Counter-offer flow** (#6): Creator gig negotiation UI
9. **Wire taste profiling to feed**: Connect `tasteProfile.ts` rerankFeed() to FeedScreen when user is authenticated
10. **Email service integration**: Connect emailTemplates.ts to Resend/SendGrid via Supabase Edge Function
11. **Push notification service**: Connect pushNotifications.ts to FCM/APNs via Supabase Edge Function
