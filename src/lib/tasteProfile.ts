'use client'

import { AnalyticsEvent, ContentWithRelations } from '@/types'
import { EVENT_WEIGHTS } from '@/lib/utils'

/**
 * TasteVector: Represents user's taste profile with weighted affinities
 * across cuisines, vibes, price preference, and neighborhoods
 */
export interface TasteVector {
  cuisines: Record<string, number>     // cuisine -> affinity score (0-1)
  vibes: Record<string, number>        // vibe -> affinity score (0-1)
  pricePreference: number              // avg preferred price range (1-4)
  neighborhoods: Record<string, number> // neighborhood -> affinity score (0-1)
}

/**
 * Calculate recency decay multiplier based on days since event
 * 0-7 days: 1.0x
 * 7-30 days: 0.7x
 * 30-90 days: 0.4x
 * 90+ days: 0.1x
 */
function getRecencyDecay(eventDate: string): number {
  const now = new Date()
  const eventTime = new Date(eventDate).getTime()
  const daysSince = (now.getTime() - eventTime) / (1000 * 60 * 60 * 24)

  if (daysSince <= 7) return 1.0
  if (daysSince <= 30) return 0.7
  if (daysSince <= 90) return 0.4
  return 0.1
}

/**
 * Build a taste profile from user's historical events and associated content
 * Applies event weights, recency decay, and normalizes scores
 */
export function buildTasteProfile(
  events: AnalyticsEvent[],
  content: ContentWithRelations[]
): TasteVector {
  const cuisineTotals: Record<string, number> = {}
  const vibeTotals: Record<string, number> = {}
  const neighborhoodTotals: Record<string, number> = {}
  let priceTotals = 0
  let weightSum = 0

  // Create content lookup map
  const contentMap = new Map(content.map(c => [c.id, c]))

  // Process each event
  for (const event of events) {
    const item = contentMap.get(event.content_id)
    if (!item) continue

    // Get event weight
    const baseWeight = EVENT_WEIGHTS[event.event_type] ?? 0.5
    const recencyMultiplier = getRecencyDecay(event.created_at)
    const weight = baseWeight * recencyMultiplier

    if (weight === 0) continue

    weightSum += weight

    // Accumulate cuisine affinities
    for (const cuisine of item.cuisine_tags) {
      cuisineTotals[cuisine] = (cuisineTotals[cuisine] ?? 0) + weight
    }

    // Accumulate vibe affinities
    for (const vibe of item.vibe_tags) {
      vibeTotals[vibe] = (vibeTotals[vibe] ?? 0) + weight
    }

    // Accumulate neighborhood affinity
    const neighborhood = item.restaurant.neighborhood
    if (neighborhood) {
      neighborhoodTotals[neighborhood] = (neighborhoodTotals[neighborhood] ?? 0) + weight
    }

    // Accumulate price preference
    priceTotals += item.restaurant.price_range * weight
  }

  // Normalize all scores to 0-1 range
  const normalizedCuisines: Record<string, number> = {}
  const normalizedVibes: Record<string, number> = {}
  const normalizedNeighborhoods: Record<string, number> = {}

  if (weightSum > 0) {
    for (const [cuisine, total] of Object.entries(cuisineTotals)) {
      normalizedCuisines[cuisine] = Math.min(1, total / weightSum)
    }
    for (const [vibe, total] of Object.entries(vibeTotals)) {
      normalizedVibes[vibe] = Math.min(1, total / weightSum)
    }
    for (const [neighborhood, total] of Object.entries(neighborhoodTotals)) {
      normalizedNeighborhoods[neighborhood] = Math.min(1, total / weightSum)
    }
  }

  const avgPrice = weightSum > 0 ? priceTotals / weightSum : 2.5

  return {
    cuisines: normalizedCuisines,
    vibes: normalizedVibes,
    pricePreference: avgPrice,
    neighborhoods: normalizedNeighborhoods,
  }
}

/**
 * Score a single feed item against user's taste profile
 * Returns a 0-1 relevance score based on:
 * - Cuisine match
 * - Vibe match
 * - Price proximity
 * - Neighborhood affinity
 */
export function scoreFeedItem(
  item: ContentWithRelations,
  profile: TasteVector
): number {
  let score = 0
  let componentCount = 0

  // Cuisine scoring
  const cuisineMatches = item.cuisine_tags.filter(c => profile.cuisines[c] !== undefined)
  if (cuisineMatches.length > 0) {
    const cuisineScore = cuisineMatches.reduce((sum, c) => sum + profile.cuisines[c], 0) / item.cuisine_tags.length
    score += cuisineScore
    componentCount++
  }

  // Vibe scoring
  const vibeMatches = item.vibe_tags.filter(v => profile.vibes[v] !== undefined)
  if (vibeMatches.length > 0) {
    const vibeScore = vibeMatches.reduce((sum, v) => sum + profile.vibes[v], 0) / item.vibe_tags.length
    score += vibeScore
    componentCount++
  }

  // Price proximity scoring (closer to preferred price = higher score)
  const priceDifference = Math.abs(item.restaurant.price_range - profile.pricePreference)
  const priceScore = Math.max(0, 1 - priceDifference / 4) // normalized to 0-1
  score += priceScore
  componentCount++

  // Neighborhood affinity scoring
  const neighborhood = item.restaurant.neighborhood
  const neighborhoodScore = profile.neighborhoods[neighborhood] ?? 0
  score += neighborhoodScore
  componentCount++

  // Return average score (0-1)
  return componentCount > 0 ? score / componentCount : 0
}

/**
 * Rerank a list of feed items by relevance to user's taste profile
 * Applies slight randomness (0.9-1.1 multiplier) to reduce filter bubbles
 */
export function rerankFeed(
  items: ContentWithRelations[],
  profile: TasteVector
): ContentWithRelations[] {
  const scored = items.map(item => ({
    item,
    score: scoreFeedItem(item, profile),
  }))

  // Apply randomness factor to reduce filter bubbles
  const scored_with_randomness = scored.map(({ item, score }) => ({
    item,
    score: score * (0.9 + Math.random() * 0.2), // random 0.9-1.1 multiplier
  }))

  // Sort by adjusted score descending
  scored_with_randomness.sort((a, b) => b.score - a.score)

  return scored_with_randomness.map(({ item }) => item)
}
