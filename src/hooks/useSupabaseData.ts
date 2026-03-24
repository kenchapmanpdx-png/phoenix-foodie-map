'use client'

import { useState, useEffect } from 'react'
import type { Restaurant, Creator, Content, Dish, ContentWithRelations } from '@/types'
import * as queries from '@/lib/queries'

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    queries.fetchRestaurants().then(data => {
      setRestaurants(data)
      setLoading(false)
    })
  }, [])

  return { restaurants, loading }
}

export function useSurfacedRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    queries.fetchSurfacedRestaurants().then(data => {
      setRestaurants(data)
      setLoading(false)
    })
  }, [])

  return { restaurants, loading }
}

export function useRestaurantBySlug(slug: string) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    queries.fetchRestaurantBySlug(slug).then(data => {
      setRestaurant(data)
      setLoading(false)
    })
  }, [slug])

  return { restaurant, loading }
}

export function useCreators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    queries.fetchCreators().then(data => {
      setCreators(data)
      setLoading(false)
    })
  }, [])

  return { creators, loading }
}

export function useContentWithRelations() {
  const [content, setContent] = useState<ContentWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    queries.fetchContentWithRelations().then(data => {
      setContent(data)
      setLoading(false)
    })
  }, [])

  return { content, loading }
}

export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    queries.fetchDishes().then(data => {
      setDishes(data)
      setLoading(false)
    })
  }, [])

  return { dishes, loading }
}

export function useDishesByRestaurant(restaurantId: string) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    queries.fetchDishesByRestaurant(restaurantId).then(data => {
      setDishes(data)
      setLoading(false)
    })
  }, [restaurantId])

  return { dishes, loading }
}

export function useContentDishLinks(restaurantId: string) {
  const [links, setLinks] = useState<Array<{ content_id: string; dish_id: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return
    queries.fetchContentDishLinks(restaurantId).then(data => {
      setLinks(data)
      setLoading(false)
    })
  }, [restaurantId])

  return { links, loading }
}

export function useContent() {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    queries.fetchContent().then(data => {
      setContent(data)
      setLoading(false)
    })
  }, [])

  return { content, loading }
}
