'use client'

import { useEffect, useRef, useState } from 'react'

interface CursorState {
  x: number
  y: number
  state: 'default' | 'expand' | 'view'
}

export function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [cursorState, setCursorState] = useState<CursorState>({
    x: 0,
    y: 0,
    state: 'default',
  })
  const rafRef = useRef<number | null>(null)
  const lastMoveTimeRef = useRef<number>(0)
  const outerPosRef = useRef({ x: 0, y: 0 })
  const innerPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Check if device supports fine pointer (desktop)
    const checkDesktop = () => {
      const isDesktopDevice = window.matchMedia('(pointer: fine)').matches
      setIsDesktop(isDesktopDevice)

      if (isDesktopDevice) {
        document.body.style.cursor = 'none'
      } else {
        document.body.style.cursor = 'auto'
      }
    }

    checkDesktop()

    const mediaQuery = window.matchMedia('(pointer: fine)')
    mediaQuery.addEventListener('change', checkDesktop)

    return () => {
      mediaQuery.removeEventListener('change', checkDesktop)
      document.body.style.cursor = 'auto'
    }
  }, [])

  useEffect(() => {
    if (!isDesktop) return

    const handleMouseMove = (e: MouseEvent) => {
      lastMoveTimeRef.current = Date.now()
      setCursorState((prev) => ({
        ...prev,
        x: e.clientX,
        y: e.clientY,
      }))
    }

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement
      const cursorAttr = target.getAttribute('data-cursor')

      if (cursorAttr === 'expand') {
        setCursorState((prev) => ({ ...prev, state: 'expand' }))
      } else if (cursorAttr === 'view') {
        setCursorState((prev) => ({ ...prev, state: 'view' }))
      }
    }

    const handleMouseLeave = () => {
      setCursorState((prev) => ({ ...prev, state: 'default' }))
    }

    document.addEventListener('mousemove', handleMouseMove as EventListener)
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave as EventListener, true)

    // Add listeners to all elements with data-cursor attribute
    const observeElements = () => {
      const expandElements = document.querySelectorAll('[data-cursor="expand"]')
      const viewElements = document.querySelectorAll('[data-cursor="view"]')

      expandElements.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter)
        el.addEventListener('mouseleave', handleMouseLeave as EventListener)
      })

      viewElements.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter)
        el.addEventListener('mouseleave', handleMouseLeave as EventListener)
      })
    }

    observeElements()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove as EventListener)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave as EventListener, true)
    }
  }, [isDesktop])

  useEffect(() => {
    if (!isDesktop || !outerRef.current || !innerRef.current) return

    const animate = () => {
      // Outer ring with slight delay (lerp)
      const outerLerp = 0.15
      outerPosRef.current.x += (cursorState.x - outerPosRef.current.x) * outerLerp
      outerPosRef.current.y += (cursorState.y - outerPosRef.current.y) * outerLerp

      // Inner dot with quick follow
      const innerLerp = 0.5
      innerPosRef.current.x += (cursorState.x - innerPosRef.current.x) * innerLerp
      innerPosRef.current.y += (cursorState.y - innerPosRef.current.y) * innerLerp

      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${outerPosRef.current.x - 12}px, ${outerPosRef.current.y - 12}px)`
      }

      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${innerPosRef.current.x - 3}px, ${innerPosRef.current.y - 3}px)`
      }

      // Check if cursor has stopped moving (performance optimization)
      const timeSinceLastMove = Date.now() - lastMoveTimeRef.current
      if (timeSinceLastMove > 100) {
        // Cancel rAF if cursor hasn't moved for 100ms
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
      } else {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    // Start animation loop
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isDesktop, cursorState])

  if (!isDesktop) return null

  const getOuterSize = () => {
    if (cursorState.state === 'expand') return 48
    if (cursorState.state === 'view') return 48
    return 24
  }

  const outerSize = getOuterSize()

  return (
    <>
      {/* Outer ring */}
      <div
        ref={outerRef}
        className="fixed pointer-events-none z-50 border-2 border-white rounded-full transition-all duration-300"
        style={{
          width: `${outerSize}px`,
          height: `${outerSize}px`,
          opacity: cursorState.state === 'expand' || cursorState.state === 'view' ? 1 : 0.6,
          mixBlendMode:
            cursorState.state === 'expand' ? 'difference' : 'normal',
        }}
      />

      {/* Inner dot */}
      <div
        ref={innerRef}
        className="fixed pointer-events-none z-50 bg-white rounded-full"
        style={{
          width: '6px',
          height: '6px',
        }}
      />

      {/* View text label */}
      {cursorState.state === 'view' && (
        <div
          ref={textRef}
          className="fixed pointer-events-none z-50 text-xs font-semibold text-white"
          style={{
            transform: `translate(${cursorState.x + 20}px, ${cursorState.y + 20}px)`,
          }}
        >
          View
        </div>
      )}
    </>
  )
}

export default CustomCursor
