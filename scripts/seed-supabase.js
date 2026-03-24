#!/usr/bin/env node
/**
 * Seed script: reads phoenix_foodie_map_seed_data.json and inserts into Supabase
 * via the Management API SQL endpoint.
 *
 * Usage: SUPABASE_ACCESS_TOKEN=<token> node scripts/seed-supabase.js
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const PROJECT_ID = 'jwpmtwptrvnnetvwutcb'
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`

// Generate deterministic UUID v5 from a string ID
function toUUID(stringId) {
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8' // DNS namespace
  const hash = crypto.createHash('sha1')
  // Parse namespace UUID to bytes
  const nsBytes = Buffer.from(namespace.replace(/-/g, ''), 'hex')
  hash.update(nsBytes)
  hash.update(stringId)
  const digest = hash.digest()
  // Set version 5
  digest[6] = (digest[6] & 0x0f) | 0x50
  // Set variant
  digest[8] = (digest[8] & 0x3f) | 0x80
  const hex = digest.toString('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function escSQL(val) {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
  if (typeof val === 'number') return String(val)
  if (Array.isArray(val)) {
    const items = val.map(v => `"${String(v).replace(/"/g, '\\"')}"`)
    return `'{${items.join(',')}}'`
  }
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`
  return `'${String(val).replace(/'/g, "''")}'`
}

async function runSQL(sql, token) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const text = await res.text()
  if (!res.ok) {
    console.error(`SQL Error (${res.status}):`, text)
    throw new Error(`SQL failed: ${res.status}`)
  }
  return JSON.parse(text)
}

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN
  if (!token) {
    console.error('Set SUPABASE_ACCESS_TOKEN env var')
    process.exit(1)
  }

  // Try multiple possible paths for the seed data
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'mnt', 'uploads', 'phoenix_foodie_map_seed_data.json'),
    '/sessions/awesome-keen-dijkstra/mnt/uploads/phoenix_foodie_map_seed_data.json',
    path.join(__dirname, 'phoenix_foodie_map_seed_data.json'),
  ]

  let data
  for (const p of possiblePaths) {
    try {
      data = JSON.parse(fs.readFileSync(p, 'utf8'))
      console.log(`Loaded seed data from: ${p}`)
      break
    } catch (e) { /* try next */ }
  }
  if (!data) {
    console.error('Could not find seed data JSON')
    process.exit(1)
  }

  // Build UUID maps
  const restaurantUUIDs = {}
  data.restaurants.forEach(r => { restaurantUUIDs[r.id] = toUUID(r.id) })

  const creatorUUIDs = {}
  data.creators.forEach(c => { creatorUUIDs[c.id] = toUUID(c.id) })

  const contentUUIDs = {}
  data.content.forEach(c => { contentUUIDs[c.id] = toUUID(c.id) })

  const dishUUIDs = {}
  data.dishes.forEach(d => { dishUUIDs[d.id] = toUUID(d.id) })

  // 1. Clear existing data (in FK order)
  console.log('Clearing existing data...')
  await runSQL(`
    DELETE FROM content_dishes;
    DELETE FROM content;
    DELETE FROM dishes;
    DELETE FROM creators;
    DELETE FROM saves;
    DELETE FROM events;
    DELETE FROM restaurants;
  `, token)
  console.log('Cleared.')

  // 2. Insert restaurants
  console.log(`Inserting ${data.restaurants.length} restaurants...`)
  const restRows = data.restaurants.map(r => {
    return `(
      '${restaurantUUIDs[r.id]}',
      ${escSQL(r.name)},
      ${escSQL(r.slug)},
      ${escSQL(r.cuisine_types)},
      ${escSQL(r.vibe_tags)},
      ${escSQL(r.neighborhood)},
      ${escSQL(r.address)},
      ${r.latitude},
      ${r.longitude},
      ${r.price_range},
      ${escSQL(r.phone)},
      ${escSQL(r.website)},
      ${escSQL(r.menu_url)},
      ${escSQL(r.hours)},
      ${escSQL(r.booking_url)},
      ${escSQL(r.delivery_url)},
      ${escSQL(r.instagram_handle)},
      ${escSQL(r.tiktok_handle)},
      ${escSQL(r.google_place_id)},
      ${escSQL(r.is_active)},
      ${escSQL(r.subscription_tier)}
    )`
  })

  // Insert in batches of 10
  for (let i = 0; i < restRows.length; i += 10) {
    const batch = restRows.slice(i, i + 10)
    await runSQL(`
      INSERT INTO restaurants (id, name, slug, cuisine_types, vibe_tags, neighborhood, address, latitude, longitude, price_range, phone, website, menu_url, hours, booking_url, delivery_url, instagram_handle, tiktok_handle, google_place_id, is_active, subscription_tier)
      VALUES ${batch.join(',\n')};
    `, token)
    console.log(`  restaurants batch ${Math.floor(i/10) + 1} done`)
  }

  // 3. Insert creators
  console.log(`Inserting ${data.creators.length} creators...`)
  const creatorRows = data.creators.map(c => {
    return `(
      '${creatorUUIDs[c.id]}',
      ${escSQL(c.display_name)},
      ${escSQL(c.slug)},
      ${escSQL(c.instagram_handle)},
      ${escSQL(c.tiktok_handle)},
      ${c.instagram_followers || 0},
      ${c.tiktok_followers || 0},
      ${escSQL(c.bio)},
      ${escSQL(c.avatar_url)},
      ${escSQL(c.tier)},
      ${escSQL(c.specialties)},
      ${escSQL(c.areas_covered)},
      ${c.rate_range_low || 0},
      ${c.rate_range_high || 0},
      ${escSQL(c.is_founding_creator)},
      ${escSQL(c.is_active)},
      ${c.platform_fee_rate || 0.15},
      ${escSQL(c.content_rights_status)}
    )`
  })
  await runSQL(`
    INSERT INTO creators (id, display_name, slug, instagram_handle, tiktok_handle, instagram_followers, tiktok_followers, bio, avatar_url, tier, specialties, areas_covered, rate_range_low, rate_range_high, is_founding_creator, is_active, platform_fee_rate, content_rights_status)
    VALUES ${creatorRows.join(',\n')};
  `, token)
  console.log('  creators done')

  // 4. Insert content
  console.log(`Inserting ${data.content.length} content rows...`)
  const contentRows = data.content.map(c => {
    const creatorUUID = creatorUUIDs[c.creator_id]
    const restaurantUUID = restaurantUUIDs[c.restaurant_id]
    if (!creatorUUID || !restaurantUUID) {
      console.warn(`  Skipping content ${c.id}: missing FK (creator=${c.creator_id}, restaurant=${c.restaurant_id})`)
      return null
    }
    return `(
      '${contentUUIDs[c.id]}',
      '${creatorUUID}',
      '${restaurantUUID}',
      ${escSQL(c.content_type)},
      ${escSQL(c.thumbnail_url || '')},
      ${escSQL(c.thumbnail_url)},
      ${c.duration_seconds || 0},
      ${escSQL(String(c.aspect_ratio || '0.8'))},
      ${escSQL(c.original_platform)},
      NULL,
      ${escSQL(c.caption)},
      ${escSQL(c.cuisine_tags || [])},
      ${escSQL(c.vibe_tags || [])},
      ${escSQL(c.sponsorship_status || 'organic')},
      CURRENT_DATE,
      TRUE,
      0, 0, 0
    )`
  }).filter(Boolean)

  for (let i = 0; i < contentRows.length; i += 10) {
    const batch = contentRows.slice(i, i + 10)
    await runSQL(`
      INSERT INTO content (id, creator_id, restaurant_id, content_type, media_url, thumbnail_url, duration_seconds, aspect_ratio, original_platform, original_url, caption, cuisine_tags, vibe_tags, sponsorship_status, publish_date, is_active, view_count, save_count, tap_count)
      VALUES ${batch.join(',\n')};
    `, token)
    console.log(`  content batch ${Math.floor(i/10) + 1} done`)
  }

  // 5. Insert dishes
  console.log(`Inserting ${data.dishes.length} dishes...`)
  const dishRows = data.dishes.map(d => {
    const restaurantUUID = restaurantUUIDs[d.restaurant_id]
    if (!restaurantUUID) {
      console.warn(`  Skipping dish ${d.id}: missing restaurant FK ${d.restaurant_id}`)
      return null
    }
    const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    return `(
      '${dishUUIDs[d.id]}',
      '${restaurantUUID}',
      ${escSQL(d.name)},
      ${escSQL(slug)},
      ${escSQL(d.category)},
      ${d.price || 0},
      ${escSQL(d.description)},
      NULL,
      ${d.feature_count || 0}
    )`
  }).filter(Boolean)

  for (let i = 0; i < dishRows.length; i += 10) {
    const batch = dishRows.slice(i, i + 10)
    await runSQL(`
      INSERT INTO dishes (id, restaurant_id, name, slug, category, price, description, thumbnail_url, feature_count)
      VALUES ${batch.join(',\n')};
    `, token)
    console.log(`  dishes batch ${Math.floor(i/10) + 1} done`)
  }

  // 6. Insert content_dishes junctions
  console.log(`Inserting ${data.content_dish_junctions.length} content_dish junctions...`)
  const junctionRows = data.content_dish_junctions.map(j => {
    const contentUUID = contentUUIDs[j.content_id]
    const dishUUID = dishUUIDs[j.dish_id]
    if (!contentUUID || !dishUUID) {
      console.warn(`  Skipping junction: missing FK (content=${j.content_id}, dish=${j.dish_id})`)
      return null
    }
    return `('${contentUUID}', '${dishUUID}', ${escSQL(j.is_primary)})`
  }).filter(Boolean)

  if (junctionRows.length > 0) {
    await runSQL(`
      INSERT INTO content_dishes (content_id, dish_id, is_primary)
      VALUES ${junctionRows.join(',\n')};
    `, token)
    console.log('  junctions done')
  }

  // 7. Verify counts
  console.log('\nVerifying row counts...')
  const counts = await runSQL(`
    SELECT
      (SELECT count(*) FROM restaurants) as restaurants,
      (SELECT count(*) FROM creators) as creators,
      (SELECT count(*) FROM content) as content,
      (SELECT count(*) FROM dishes) as dishes,
      (SELECT count(*) FROM content_dishes) as content_dishes;
  `, token)
  console.log('Row counts:', JSON.stringify(counts, null, 2))
  console.log('\nSeed complete!')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
