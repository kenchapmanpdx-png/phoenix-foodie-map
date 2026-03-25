'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface AnimatedTextProps {
  children: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  animation?: 'reveal' | 'fade' | 'scramble'
  delay?: number
  stagger?: number
}

export function AnimatedText({
  children,
  as: Component = 'span',
  className = '',
  animation = 'reveal',
  delay = 0,
  stagger = 0.05,
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    if (animation === 'reveal') {
      setupRevealAnimation(ref.current, delay, stagger)
    } else if (animation === 'fade') {
      setupFadeAnimation(ref.current, delay)
    } else if (animation === 'scramble') {
      setupScrambleAnimation(ref.current, delay)
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === ref.current) {
          trigger.kill()
        }
      })
    }
  }, [animation, delay, stagger])

  return (
    <>
      {Component === 'h1' && (
        <h1 ref={ref as any} className={className}>
          {children}
        </h1>
      )}
      {Component === 'h2' && (
        <h2 ref={ref as any} className={className}>
          {children}
        </h2>
      )}
      {Component === 'h3' && (
        <h3 ref={ref as any} className={className}>
          {children}
        </h3>
      )}
      {Component === 'p' && (
        <p ref={ref as any} className={className}>
          {children}
        </p>
      )}
      {Component === 'span' && (
        <span ref={ref as any} className={className}>
          {children}
        </span>
      )}
    </>
  )
}

function setupRevealAnimation(
  element: HTMLElement,
  delay: number,
  stagger: number
) {
  const text = element.textContent || ''
  const words = text.split(/\s+/)

  element.innerHTML = ''

  words.forEach((word) => {
    const wrapper = document.createElement('span')
    wrapper.style.display = 'inline-block'
    wrapper.style.overflow = 'hidden'
    wrapper.style.marginRight = '0.25em'

    const wordSpan = document.createElement('span')
    wordSpan.textContent = word
    wordSpan.style.display = 'block'

    wrapper.appendChild(wordSpan)
    element.appendChild(wrapper)
  })

  const wordSpans = element.querySelectorAll('span > span')

  gsap.fromTo(
    wordSpans,
    {
      y: '100%',
    },
    {
      y: '0%',
      duration: 0.6,
      ease: 'power3.out',
      delay: delay,
      stagger: stagger,
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        markers: false,
      },
    }
  )
}

function setupFadeAnimation(element: HTMLElement, delay: number) {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        markers: false,
      },
    }
  )
}

function setupScrambleAnimation(element: HTMLElement, delay: number) {
  const originalText = element.textContent || ''
  const glyphs = '!@#$%^&*_+-=[]{}|;:,.<>?abcdefghijklmnopqrstuvwxyz'

  let animationActive = true
  let frameCount = 0
  const duration = 60 // frames

  const startAnimation = () => {
    const animateFrame = () => {
      if (!animationActive || frameCount >= duration) {
        element.textContent = originalText
        animationActive = false
        return
      }

      let scrambledText = ''
      const progress = frameCount / duration

      for (let i = 0; i < originalText.length; i++) {
        if (originalText[i] === ' ') {
          scrambledText += ' '
        } else if (Math.random() < progress) {
          scrambledText += originalText[i]
        } else {
          scrambledText += glyphs[Math.floor(Math.random() * glyphs.length)]
        }
      }

      element.textContent = scrambledText
      frameCount++
      requestAnimationFrame(animateFrame)
    }

    gsap.delayedCall(delay, () => {
      animateFrame()
    })
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && animationActive) {
          startAnimation()
          observer.unobserve(element)
        }
      })
    },
    { threshold: 0.5 }
  )

  observer.observe(element)

  return () => {
    animationActive = false
    observer.unobserve(element)
  }
}
