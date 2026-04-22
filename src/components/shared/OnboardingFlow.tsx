'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import { CUISINE_TYPES, VIBE_TAGS, NEIGHBORHOODS } from '@/lib/constants'
import type { CuisineType, VibeTag } from '@/types'

export default function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([])
  const [selectedVibes, setSelectedVibes] = useState<VibeTag[]>([])
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, setUser } = useUserStore()

  const handleCuisineToggle = (cuisine: CuisineType) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine))
    } else if (selectedCuisines.length < 3) {
      setSelectedCuisines([...selectedCuisines, cuisine])
    }
  }

  const handleVibeToggle = (vibe: VibeTag) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter((v) => v !== vibe))
    } else if (selectedVibes.length < 3) {
      setSelectedVibes([...selectedVibes, vibe])
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  // Flag checked by '/' to decide whether to short-circuit to onboarding.
  const markOnboarded = () => {
    try { localStorage.setItem('pfm_onboarded', '1') } catch {}
  }

  const handleSkip = () => {
    if (step < 3) { handleNext(); return }
    // Skip on final step = exit onboarding entirely (flag + go to feed).
    markOnboarded()
    router.push('/feed')
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      if (user) {
        const updatedUser = {
          ...user,
          preferred_cuisines: selectedCuisines,
          preferred_vibes: selectedVibes,
          default_area: selectedNeighborhood || user.default_area,
          onboarding_completed: true,
        }
        setUser(updatedUser)
      } else {
        // Anonymous user: stash prefs in localStorage so Home can personalize.
        try {
          localStorage.setItem(
            'pfm_guest_prefs',
            JSON.stringify({
              preferred_cuisines: selectedCuisines,
              preferred_vibes: selectedVibes,
              default_area: selectedNeighborhood,
            })
          )
        } catch {}
      }
      markOnboarded()
      router.push('/feed')
    } finally {
      setIsLoading(false)
    }
  }

  // Warm gradient combinations for cuisine cards
  const cuisineGradients = [
    'from-amber-900 via-orange-700 to-red-600',
    'from-orange-800 via-yellow-600 to-amber-500',
    'from-red-900 via-orange-600 to-yellow-500',
    'from-yellow-900 via-amber-700 to-orange-600',
    'from-orange-700 via-red-600 to-pink-500',
    'from-amber-800 via-orange-600 to-red-500',
    'from-red-800 via-yellow-600 to-orange-500',
    'from-orange-900 via-amber-600 to-yellow-500',
    'from-amber-700 via-orange-600 to-red-500',
    'from-yellow-800 via-orange-700 to-red-600',
  ]

  const cuisineEmojis: Record<string, string> = {
    Italian: '🍝',
    Japanese: '🍱',
    Mexican: '🌮',
    Thai: '🥘',
    Indian: '🍛',
    Chinese: '🥡',
    Vietnamese: '🍲',
    Korean: '🍜',
    Mediterranean: '🫒',
    American: '🍔',
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-primary)]">
      {/* Progress Bar */}
      <div className="sticky top-0 bg-[var(--color-surface-primary)] z-10 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            {step === 1 && 'What are you craving?'}
            {step === 2 && 'Pick a vibe'}
            {step === 3 && 'Your neighborhood?'}
          </h1>
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">{step}/3</span>
        </div>
        <div className="w-full bg-[var(--color-surface-card)] rounded-full h-2 overflow-hidden">
          <div
            className="bg-[var(--color-accent-primary)] h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24">
        {/* Step 1: Cuisines */}
        {step === 1 && (
          <div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">Select up to 3 cuisines</p>
            <div className="grid grid-cols-2 gap-4">
              {CUISINE_TYPES.map((cuisine, index) => (
                <button
                  key={cuisine.value}
                  onClick={() => handleCuisineToggle(cuisine.value)}
                  className={`
                    bg-gradient-to-br ${cuisineGradients[index]}
                    rounded-2xl overflow-hidden
                    aspect-[4/3]
                    flex items-end
                    cursor-pointer
                    relative
                    transition-all duration-150
                    ${selectedCuisines.includes(cuisine.value) ? 'ring-2 ring-[var(--color-accent-primary)]' : ''}
                  `}
                >
                  {/* Background emoji */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-7xl opacity-10">{cuisineEmojis[cuisine.label] || '🍽️'}</span>
                  </div>

                  {/* Checkmark overlay if selected */}
                  {selectedCuisines.includes(cuisine.value) && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--color-accent-primary)]" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" fill="currentColor" />
                        <path d="M9 12.5l2 2 4-4" stroke="white" strokeWidth={2} fill="none" />
                      </svg>
                    </div>
                  )}

                  {/* Bottom scrim for readability */}
                  <div className="card-scrim-bottom absolute inset-0 pointer-events-none" />

                  {/* Label overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                      {cuisine.label}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Vibes */}
        {step === 2 && (
          <div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">Select up to 3 vibes</p>
            <div className="flex flex-wrap gap-3">
              {VIBE_TAGS.map((vibe) => (
                <button
                  key={vibe.value}
                  onClick={() => handleVibeToggle(vibe.value)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium
                    transition-all duration-150
                    ${
                      selectedVibes.includes(vibe.value)
                        ? 'bg-[var(--color-accent-primary)] text-white'
                        : 'bg-[var(--color-surface-card)] text-[var(--color-text-primary)]'
                    }
                  `}
                >
                  {vibe.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Neighborhood */}
        {step === 3 && (
          <div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">Select your default neighborhood</p>
            <div className="grid grid-cols-2 gap-3">
              {NEIGHBORHOODS.map((neighborhood) => (
                <button
                  key={neighborhood}
                  onClick={() => setSelectedNeighborhood(neighborhood)}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium
                    transition-all duration-150
                    ${
                      selectedNeighborhood === neighborhood
                        ? 'bg-[var(--color-accent-primary)] text-white'
                        : 'bg-[var(--color-surface-card)] text-[var(--color-text-primary)]'
                    }
                  `}
                >
                  {neighborhood}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface-primary)] border-t border-[var(--color-surface-border)] px-4 py-4 flex gap-3">
        <button
          onClick={handleSkip}
          className="flex-1 px-4 py-3 rounded-lg text-[var(--color-text-primary)] font-semibold border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-card)] transition-colors"
        >
          Skip
        </button>
        <button
          onClick={step === 3 ? handleComplete : handleNext}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-[var(--color-accent-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-accent-primary)]/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Setting up...' : step === 3 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  )
}
