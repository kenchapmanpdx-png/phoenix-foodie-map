import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  rootMargin?: string
  /**
   * When true (default), disconnects after the first intersection — the
   * returned boolean latches to true. When false, the boolean tracks the
   * current intersection state continuously (use this for video play/pause).
   */
  once?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  const once = options.once ?? true
  const rootMargin = options.rootMargin ?? '0px'
  const threshold = options.threshold ?? 0.1
  // Stable dep key for threshold (may be number or number[]).
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : String(threshold)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (once) {
          if (entry.isIntersecting) {
            setIsIntersecting(true)
            observer.unobserve(entry.target)
            observer.disconnect()
          }
        } else {
          setIsIntersecting(entry.isIntersecting)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [once, thresholdKey, rootMargin])

  return [ref, isIntersecting]
}
