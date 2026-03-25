'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugins once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Makes an element subtly attract toward cursor on hover
 * @param strength - How much the element follows the cursor (0.3 = 30% of the way)
 */
export function useMagnetic(strength: number = 0.3) {
  const ref = useRef<HTMLElement>(null)
  const quickToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const rect = element.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Create quickTo instances for smooth per-frame updates
    const quickToX = gsap.quickTo(element, 'x', {
      duration: 0.5,
      ease: 'power3.out',
    })
    const quickToY = gsap.quickTo(element, 'y', {
      duration: 0.5,
      ease: 'power3.out',
    })

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - (rect.left + centerX)
      const y = e.clientY - (rect.top + centerY)

      quickToX(x * strength)
      quickToY(y * strength)
    }

    const handleMouseLeave = () => {
      quickToX(0)
      quickToY(0)
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [strength])

  return ref
}

/**
 * Creates a subtle parallax effect on scroll
 * @param speed - How fast the element moves relative to scroll (0.5 = half speed)
 */
export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.to(ref.current, {
      y: () => window.innerHeight * speed,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
        markers: false,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === ref.current) {
          trigger.kill()
        }
      })
    }
  }, [speed])

  return ref
}

interface RevealOptions {
  y?: number
  duration?: number
  stagger?: number
  delay?: number
}

/**
 * Premium reveal animation triggered by scroll
 * Reveals with opacity + y transform using power3.out ease
 */
export function useRevealOnScroll(options: RevealOptions = {}) {
  const ref = useRef<HTMLElement>(null)
  const {
    y = 30,
    duration = 0.8,
    stagger = 0,
    delay = 0,
  } = options

  useEffect(() => {
    if (!ref.current) return

    gsap.fromTo(
      ref.current,
      {
        opacity: 0,
        y: y,
      },
      {
        opacity: 1,
        y: 0,
        duration: duration,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          markers: false,
        },
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === ref.current) {
          trigger.kill()
        }
      })
    }
  }, [y, duration, delay, stagger])

  return ref
}

interface StaggerOptions {
  duration?: number
  delay?: number
}

/**
 * Staggers child element reveals within a container
 */
export function useStaggerChildren(
  containerRef: React.RefObject<HTMLElement>,
  childSelector: string,
  options: StaggerOptions = {}
) {
  const { duration = 0.8, delay = 0 } = options

  useEffect(() => {
    if (!containerRef.current) return

    const children = containerRef.current.querySelectorAll(childSelector)

    gsap.fromTo(
      children,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: duration,
        delay: delay,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          markers: false,
        },
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === containerRef.current) {
          trigger.kill()
        }
      })
    }
  }, [childSelector, duration, delay])
}

/**
 * Splits text into lines/words and reveals them with a clip-mask slide-up effect
 * For hero headings
 */
export function useTextReveal() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const text = ref.current.textContent || ''
    const words = text.split(/\s+/)

    // Clear the element
    ref.current.innerHTML = ''

    // Create wrapped words
    words.forEach((word, index) => {
      const wrapper = document.createElement('span')
      wrapper.style.display = 'inline-block'
      wrapper.style.overflow = 'hidden'
      wrapper.style.marginRight = '0.25em'

      const wordSpan = document.createElement('span')
      wordSpan.textContent = word
      wordSpan.style.display = 'block'

      wrapper.appendChild(wordSpan)
      ref.current?.appendChild(wrapper)

      // Animate each word
      gsap.fromTo(
        wordSpan,
        {
          y: '100%',
        },
        {
          y: '0%',
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            markers: false,
          },
          stagger: 0.05,
        }
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === ref.current) {
          trigger.kill()
        }
      })
    }
  }, [])

  return ref
}

interface CountUpReturn {
  ref: React.RefObject<HTMLDivElement | null>
  value: number
}

/**
 * Animates a number from 0 to endValue when scrolled into view
 */
export function useCountUp(endValue: number, duration: number = 2): CountUpReturn {
  const ref = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(0)
  const counterRef = useRef({ current: 0 })

  useEffect(() => {
    if (!ref.current) return

    const updateCounter = () => {
      setValue(Math.floor(counterRef.current.current))
    }

    gsap.to(counterRef.current, {
      current: endValue,
      duration: duration,
      ease: 'power2.out',
      onUpdate: updateCounter,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        markers: false,
        onEnter: () => {
          // Animation triggers automatically via scrollTrigger
        },
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === ref.current) {
          trigger.kill()
        }
      })
    }
  }, [endValue, duration])

  return { ref, value }
}
