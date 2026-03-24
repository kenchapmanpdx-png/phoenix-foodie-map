# Blueprint v2 Amendments — Reference Copy

Saved from user upload 2026-03-24. All 12 amendments to be implemented for MVP.

## Schema Changes (ALREADY LIVE in Supabase)

- restaurants: `creator_count`, `content_count`, `is_surfaced`
- users: `last_app_open`
- saves: `last_action_at`
- events: `dish_id`, `time_of_day_bucket`, expanded `event_type` check
- Trigger: `trg_recompute_restaurant_metrics` on content table
- Indexes: `idx_restaurants_is_surfaced`, `idx_content_restaurant_active`, `idx_events_dish_id`, `idx_saves_last_action`

## Amendments Summary

1. Home Screen "Dishes People Are Ordering" — horizontal dish cards, dish photos from creator content
2. Time-of-Day Content Ranking — vibe boost/suppress by time window
3. Open Now Default — on 11am-12am, dimmed closed restaurants
4. Restaurant Surfacing Threshold — is_surfaced filter on all queries
5. Creator Pick Badge — when creator_count >= 3
6. In-App Menu View — dish catalog on restaurant detail
7. Search Dish Priority — dish results first on matching queries
8. No Urgency/Scarcity Messaging — design principle enforcement
9. Re-Engagement Email Sequence — weekly digest, monthly recap, win-back
10. Push Notification Triggers — saved-no-action, new content, vibe match
11. Restaurant Dashboard Benchmark Panel — industry comparison metrics
12. Behavioral Taste Profiling — weighted implicit signals, taste vector
