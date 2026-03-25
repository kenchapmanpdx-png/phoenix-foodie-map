'use client'

import { useEffect, useRef, ReactNode } from 'react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface SmoothScrollProps {
  children: ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Only initialize on desktop with fine pointer
    const isDesktop = window.matchMedia('(pointer: fine)').matches

    if (!isDesktop) {
      return
    }

    // Initialize Lenis
    const lenis = new Lenis({
      lerp: 0.1, // Luxury smooth scroll feel
      wheelMultiplier: 1,
      smoothWheel: true,
    })

    lenisRef.current = lenis

    // Sync with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Add lenis to GSAP ticker for continuous updates
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000) // Convert to milliseconds
    })

    // Cleanup function
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }

      gsap.ticker.remove((time) => {
        if (lenisRef.current) {
          lenisRef.current.raf(time * 1000)
        }
      })

      // Re-enable default scroll behavior
      ScrollTrigger.refresh()
    }
  }, [])

  return <>{children}</>
}

export default SmoothScroll
