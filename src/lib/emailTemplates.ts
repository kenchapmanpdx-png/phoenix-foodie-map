'use client'

import { Content, Dish, Restaurant } from '@/types'

export interface EmailTemplate {
  id: string
  subject: string
  trigger: 'weekly_digest' | 'monthly_recap' | 'win_back_7d' | 'win_back_30d'
  description: string
  buildContent: (data: Record<string, unknown>) => EmailContent
}

export interface EmailContent {
  subject: string
  preheader: string
  sections: EmailSection[]
}

export interface EmailSection {
  type: 'hero' | 'content_grid' | 'restaurant_highlight' | 'cta' | 'stats'
  data: Record<string, unknown>
}

// Weekly digest template: top dishes and new content from saved restaurants
export const weeklyDigestTemplate: EmailTemplate = {
  id: 'weekly_digest',
  subject: 'This week on Phoenix Foodie Map',
  trigger: 'weekly_digest',
  description: 'Weekly digest with trending dishes, new restaurants, and content from saved restaurants',
  buildContent: (data) => {
    const {
      weekNumber,
      topDishes = [],
      newRestaurants = [],
      savedRestaurantContent = [],
      userName = 'there',
    } = data as {
      weekNumber?: number
      topDishes?: Dish[]
      newRestaurants?: Restaurant[]
      savedRestaurantContent?: Content[]
      userName?: string
    }

    return {
      subject: `This week on Phoenix Foodie Map - Week ${weekNumber || 1}`,
      preheader: `Your weekly rundown: ${topDishes.length} hot dishes + new spots`,
      sections: [
        {
          type: 'hero',
          data: {
            title: `Hey ${userName}, here's what's hot this week`,
            subtitle: 'Trending dishes, new restaurants, and fresh content from places you love',
          },
        },
        {
          type: 'stats',
          data: {
            stats: [
              { label: 'Hot Dishes', value: topDishes.length },
              { label: 'New Spots', value: newRestaurants.length },
              { label: 'Fresh Content', value: savedRestaurantContent.length },
            ],
          },
        },
        {
          type: 'content_grid',
          data: {
            title: 'Top Dishes This Week',
            items: topDishes.slice(0, 6).map((dish) => ({
              id: dish.id,
              name: dish.name,
              restaurant: dish.restaurant_id,
              category: dish.category,
              price: dish.price,
              thumbnail: dish.thumbnail_url,
            })),
          },
        },
        {
          type: 'restaurant_highlight',
          data: {
            title: 'New Restaurants',
            restaurants: newRestaurants.slice(0, 3).map((r) => ({
              id: r.id,
              name: r.name,
              neighborhood: r.neighborhood,
              cuisines: r.cuisine_types.slice(0, 2),
              priceRange: r.price_range,
            })),
          },
        },
        {
          type: 'content_grid',
          data: {
            title: 'New Content from Your Saved Restaurants',
            items: savedRestaurantContent.slice(0, 4).map((c) => ({
              id: c.id,
              title: c.caption,
              restaurantName: c.restaurant_id,
              thumbnail: c.thumbnail_url,
              type: c.content_type,
            })),
          },
        },
        {
          type: 'cta',
          data: {
            text: 'Explore More on Phoenix Foodie Map',
            url: 'https://phoenixfoodiemap.com',
            backgroundColor: '#FF6B35',
          },
        },
      ],
    }
  },
}

// Monthly recap: dishes explored, restaurants visited, neighborhoods covered
export const monthlyRecapTemplate: EmailTemplate = {
  id: 'monthly_recap',
  subject: 'Your month in food',
  trigger: 'monthly_recap',
  description: 'Monthly recap of food exploration: dishes, restaurants, and neighborhoods',
  buildContent: (data) => {
    const {
      monthName = 'this month',
      uniqueRestaurants = [],
      uniqueDishes = [],
      neighborhoodsCovered = [],
      totalSaves = 0,
      topCuisine = 'All Cuisines',
      userName = 'there',
    } = data as {
      monthName?: string
      uniqueRestaurants?: Restaurant[]
      uniqueDishes?: Dish[]
      neighborhoodsCovered?: string[]
      totalSaves?: number
      topCuisine?: string
      userName?: string
    }

    return {
      subject: `Your ${monthName} in food`,
      preheader: `${uniqueRestaurants.length} restaurants, ${uniqueDishes.length} dishes, ${neighborhoodsCovered.length} neighborhoods`,
      sections: [
        {
          type: 'hero',
          data: {
            title: `${userName}'s food month recap`,
            subtitle: `A look back at your Phoenix food adventure in ${monthName}`,
          },
        },
        {
          type: 'stats',
          data: {
            stats: [
              { label: 'Restaurants', value: uniqueRestaurants.length },
              { label: 'Dishes Discovered', value: uniqueDishes.length },
              { label: 'Neighborhoods', value: neighborhoodsCovered.length },
              { label: 'Saves', value: totalSaves },
            ],
          },
        },
        {
          type: 'restaurant_highlight',
          data: {
            title: 'Restaurants You Explored',
            restaurants: uniqueRestaurants.slice(0, 5).map((r) => ({
              id: r.id,
              name: r.name,
              neighborhood: r.neighborhood,
              cuisines: r.cuisine_types.slice(0, 2),
            })),
          },
        },
        {
          type: 'content_grid',
          data: {
            title: 'Standout Dishes',
            items: uniqueDishes.slice(0, 6).map((d) => ({
              id: d.id,
              name: d.name,
              category: d.category,
              price: d.price,
              thumbnail: d.thumbnail_url,
            })),
          },
        },
        {
          type: 'hero',
          data: {
            title: 'Your Top Cuisine',
            subtitle: topCuisine,
          },
        },
        {
          type: 'cta',
          data: {
            text: 'Continue Your Food Journey',
            url: 'https://phoenixfoodiemap.com',
            backgroundColor: '#FF6B35',
          },
        },
      ],
    }
  },
}

// Win-back 7d: new content from saved restaurants (7-day inactive)
export const winBack7dTemplate: EmailTemplate = {
  id: 'win_back_7d',
  subject: 'We miss you',
  trigger: 'win_back_7d',
  description: 'Re-engagement email for 7-day inactive users with new content from their saved restaurants',
  buildContent: (data) => {
    const { savedRestaurants = [], newContent = [], userName = 'there' } = data as {
      savedRestaurants?: Restaurant[]
      newContent?: Content[]
      userName?: string
    }

    return {
      subject: 'We miss you on Phoenix Foodie Map',
      preheader: `${newContent.length} new videos from places you saved`,
      sections: [
        {
          type: 'hero',
          data: {
            title: `We miss you, ${userName}!`,
            subtitle: `There's been ${newContent.length} new posts from restaurants you saved`,
          },
        },
        {
          type: 'content_grid',
          data: {
            title: 'New Content from Your Saved Restaurants',
            items: newContent.slice(0, 4).map((c) => ({
              id: c.id,
              title: c.caption,
              restaurantName: c.restaurant_id,
              thumbnail: c.thumbnail_url,
              type: c.content_type,
              creatorName: c.creator_id,
            })),
          },
        },
        {
          type: 'restaurant_highlight',
          data: {
            title: 'Your Saved Spots',
            restaurants: savedRestaurants.slice(0, 3).map((r) => ({
              id: r.id,
              name: r.name,
              neighborhood: r.neighborhood,
            })),
          },
        },
        {
          type: 'cta',
          data: {
            text: 'See What\'s New',
            url: 'https://phoenixfoodiemap.com',
            backgroundColor: '#FF6B35',
          },
        },
      ],
    }
  },
}

// Win-back 30d: best new restaurants + popular dishes (30-day inactive)
export const winBack30dTemplate: EmailTemplate = {
  id: 'win_back_30d',
  subject: 'See what\'s new',
  trigger: 'win_back_30d',
  description: 'Re-engagement email for 30-day inactive users with best new restaurants and trending dishes',
  buildContent: (data) => {
    const {
      bestNewRestaurants = [],
      trendingDishes = [],
      userName = 'there',
    } = data as {
      bestNewRestaurants?: Restaurant[]
      trendingDishes?: Dish[]
      userName?: string
    }

    return {
      subject: 'See what\'s new on Phoenix Foodie Map',
      preheader: `${bestNewRestaurants.length} new restaurants + ${trendingDishes.length} trending dishes`,
      sections: [
        {
          type: 'hero',
          data: {
            title: `${userName}, the food scene has evolved`,
            subtitle: 'Exciting new restaurants and trending dishes you need to see',
          },
        },
        {
          type: 'restaurant_highlight',
          data: {
            title: 'Best New Restaurants',
            restaurants: bestNewRestaurants.slice(0, 4).map((r) => ({
              id: r.id,
              name: r.name,
              neighborhood: r.neighborhood,
              cuisines: r.cuisine_types.slice(0, 2),
              priceRange: r.price_range,
            })),
          },
        },
        {
          type: 'content_grid',
          data: {
            title: 'Trending Dishes',
            items: trendingDishes.slice(0, 6).map((d) => ({
              id: d.id,
              name: d.name,
              category: d.category,
              price: d.price,
              thumbnail: d.thumbnail_url,
            })),
          },
        },
        {
          type: 'cta',
          data: {
            text: 'Start Exploring',
            url: 'https://phoenixfoodiemap.com',
            backgroundColor: '#FF6B35',
          },
        },
      ],
    }
  },
}

// Export all templates
export const emailTemplates: EmailTemplate[] = [
  weeklyDigestTemplate,
  monthlyRecapTemplate,
  winBack7dTemplate,
  winBack30dTemplate,
]

// Helper to get template by trigger type
export function getTemplateByTrigger(
  trigger: 'weekly_digest' | 'monthly_recap' | 'win_back_7d' | 'win_back_30d'
): EmailTemplate | undefined {
  return emailTemplates.find((t) => t.trigger === trigger)
}
