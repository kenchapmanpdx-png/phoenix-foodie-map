'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HomeScreen from '@/components/home/HomeScreen'

// First-visit gate: redirect to /onboarding unless the user has either
// completed onboarding or explicitly skipped. Flag is set by OnboardingFlow.
export default function Home() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('pfm_onboarded') === '1') {
        setChecked(true)
      } else {
        router.replace('/onboarding')
      }
    } catch {
      // localStorage unavailable (privacy mode, SSR edge) — let Home render.
      setChecked(true)
    }
  }, [router])

  if (!checked) {
    // Brief blank frame while we decide — prevents Home flashing before redirect.
    return <div className="min-h-screen bg-[var(--color-surface-primary)]" />
  }

  return <HomeScreen />
}
