'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import { CUISINE_TYPES, VIBE_TAGS, NEIGHBORHOODS } from '@/lib/constants'
import { CUISINE_FALLBACK_IMAGES, CUISINE_EMOJI } from '@/lib/cuisineImages'
import type { CuisineType, VibeTag } from '@/types'

// Vibe emoji + gradient tint — mirrors the Home Vibe Check pills so
// onboarding and home feel like the same product.
const VIBE_META: Record<string, { emoji: string; gradient: string }> = {
  'Date Night':     { emoji: '🕯️', gradient: 'from-rose-500/30 to-red-700/20 border-rose-400/30' },
  'Trendy / New':   { emoji: '✨', gradient: 'from-fuchsia-500/30 to-purple-700/20 border-fuchsia-400/30' },
  'Hidden Gem':     { emoji: '💎', gradient: 'from-cyan-500/30 to-teal-700/20 border-cyan-400/30' },
  'Happy Hour':     { emoji: '🍸', gradient: 'from-amber-500/30 to-orange-700/20 border-amber-400/30' },
  'Family':         { emoji: '👨‍👩‍👧', gradient: 'from-emerald-500/30 to-green-700/20 border-emerald-400/30' },
  'Group Dinner':   { emoji: '🍻', gradient: 'from-orange-500/30 to-red-700/20 border-orange-400/30' },
  'Patio':          { emoji: '🌵', gradient: 'from-lime-500/30 to-emerald-700/20 border-lime-400/30' },
  'Brunch':         { emoji: '🥞', gradient: 'from-yellow-500/30 to-amber-700/20 border-yellow-400/30' },
  'Late Night':     { emoji: '🌙', gradient: 'from-indigo-500/30 to-slate-700/20 border-indigo-400/30' },
  'Quick Bite':     { emoji: '⚡', gradient: 'from-yellow-500/30 to-orange-700/20 border-yellow-400/30' },
  'Solo-Friendly':  { emoji: '🎧', gradient: 'from-sky-500/30 to-blue-700/20 border-sky-400/30' },
  'Splurge-Worthy': { emoji: '🥂', gradient: 'from-amber-400/30 to-yellow-700/20 border-amber-300/40' },
}

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

  const markOnboarded = () => {
    try { localStorage.setItem('pfm_onboarded', '1') } catch {}
  }

  const handleSkip = () => {
    if (step < 3) { handleNext(); return }
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

  const stepCopy = {
    1: { title: 'What are you craving?', sub: 'Pick up to 3 cuisines — we tune your feed around them.', counter: selectedCuisines.length },
    2: { title: "Set the vibe", sub: 'Pick up to 3. Date night? Hidden gem? Patio hangout?', counter: selectedVibes.length },
    3: { title: 'Your home base', sub: 'Where in the Valley do you start from?', counter: selectedNeighborhood ? 1 : 0 },
  }[step as 1 | 2 | 3]

  return (
    <div className="relative min-h-[100dvh] bg-[var(--color-surface-primary)] overflow-x-hidden">
      {/* Ambient glow — gives the screen warmth without competing with tiles */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(520px circle at 10% 0%, rgba(245, 158, 11, 0.18), transparent 55%),
            radial-gradient(420px circle at 90% 100%, rgba(220, 38, 38, 0.14), transparent 60%)
          `,
        }}
      />

      {/* Mobile-width column — prevents tiles from exploding on desktop/tablet */}
      <div className="relative z-10 mx-auto w-full max-w-md pb-32">
        {/* Header — brand mark + progress */}
        <header className="sticky top-0 z-20 glass-heavy backdrop-blur-xl px-5 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="relative w-7 h-7 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] via-orange-500 to-red-600 opacity-90" />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--color-surface-primary)]" />
              </span>
              <span className="font-black text-[13px] tracking-tight text-[var(--color-text-primary)] leading-none">
                phx<span className="text-[var(--color-accent-primary)]">.</span>foodie
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-white/55">
              Step {step} of 3
            </span>
          </div>

          {/* Segmented progress — 3 chunks, fill per completed step */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  n <= step
                    ? 'bg-gradient-to-r from-[var(--color-accent-primary)] to-red-500'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <div className="mt-4">
            <h1 className="heading-hero text-2xl font-bold text-[var(--color-text-primary)] leading-tight">
              {stepCopy.title}
            </h1>
            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)] leading-snug">
              {stepCopy.sub}
            </p>
            {step !== 3 && (
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-primary)]">
                {stepCopy.counter} / 3 selected
              </p>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="px-4 pt-5">
          {/* ─── Step 1: Cuisines (photo tiles) ─── */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2.5">
              {CUISINE_TYPES.map((cuisine) => {
                const selected = selectedCuisines.includes(cuisine.value)
                const atCap = !selected && selectedCuisines.length >= 3
                const image = CUISINE_FALLBACK_IMAGES[cuisine.value]
                const emoji = CUISINE_EMOJI[cuisine.value] || '🍽️'

                return (
                  <button
                    key={cuisine.value}
                    onClick={() => handleCuisineToggle(cuisine.value)}
                    disabled={atCap}
                    className={`
                      relative overflow-hidden rounded-xl aspect-[4/5]
                      transition-all duration-200
                      ${selected ? 'ring-2 ring-[var(--color-accent-primary)] shadow-[0_8px_30px_rgba(245,158,11,0.3)] scale-[0.98]' : 'ring-1 ring-white/5 hover:ring-white/15'}
                      ${atCap ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                    `}
                  >
                    {/* Photo background */}
                    {image ? (
                      <img
                        src={image}
                        alt={cuisine.label}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                          selected ? 'scale-105' : ''
                        }`}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-800 flex items-center justify-center">
                        <span className="text-6xl opacity-40">{emoji}</span>
                      </div>
                    )}

                    {/* Bottom scrim for label legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/0 pointer-events-none" />

                    {/* Emoji badge top-left — adds personality even on photo tiles */}
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur border border-white/15 flex items-center justify-center text-sm">
                      {emoji}
                    </div>

                    {/* Selection check */}
                    {selected && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}

                    {/* Label */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 text-left">
                      <h3 className="text-sm font-bold text-white leading-tight drop-shadow-md">
                        {cuisine.label}
                      </h3>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* ─── Step 2: Vibes (gradient pills, matches home Vibe Check) ─── */}
          {step === 2 && (
            <div className="flex flex-wrap gap-2">
              {VIBE_TAGS.map((vibe) => {
                const selected = selectedVibes.includes(vibe.value)
                const atCap = !selected && selectedVibes.length >= 3
                const meta = VIBE_META[vibe.value] || {
                  emoji: '🍽️',
                  gradient: 'from-white/10 to-white/5 border-white/10',
                }

                return (
                  <button
                    key={vibe.value}
                    onClick={() => handleVibeToggle(vibe.value)}
                    disabled={atCap}
                    className={`
                      inline-flex items-center gap-1.5
                      pl-3 pr-4 py-2 rounded-full
                      text-sm font-semibold
                      transition-all duration-200
                      border backdrop-blur-md
                      ${selected
                        ? 'bg-gradient-to-r from-[var(--color-accent-primary)] to-red-500 text-black border-[var(--color-accent-primary)] shadow-[0_6px_20px_rgba(245,158,11,0.35)] scale-[1.02]'
                        : `bg-gradient-to-br ${meta.gradient} text-[var(--color-text-primary)] hover:brightness-125 hover:scale-[1.03]`}
                      ${atCap ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
                    `}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {meta.emoji}
                    </span>
                    <span>{vibe.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* ─── Step 3: Neighborhood ─── */}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-2">
              {NEIGHBORHOODS.map((neighborhood) => {
                const selected = selectedNeighborhood === neighborhood
                return (
                  <button
                    key={neighborhood}
                    onClick={() => setSelectedNeighborhood(neighborhood)}
                    className={`
                      flex items-center gap-2
                      px-3 py-3 rounded-xl text-sm font-semibold text-left
                      transition-all duration-200 border backdrop-blur-sm
                      ${selected
                        ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]/60 shadow-[0_6px_20px_rgba(245,158,11,0.18)]'
                        : 'bg-[var(--color-surface-card)]/70 text-[var(--color-text-primary)] border-white/5 hover:border-white/15'}
                    `}
                  >
                    <svg
                      className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-[var(--color-accent-primary)]' : 'text-white/40'}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="line-clamp-1">{neighborhood}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom action bar — mirrors mobile container width */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[var(--color-surface-primary)] via-[var(--color-surface-primary)]/95 to-[var(--color-surface-primary)]/0 pt-8 pb-5">
        <div className="mx-auto w-full max-w-md px-4 flex gap-2.5">
          <button
            onClick={handleSkip}
            className="px-5 py-3.5 rounded-full text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={step === 3 ? handleComplete : handleNext}
            disabled={isLoading}
            className="flex-1 px-4 py-3.5 rounded-full text-sm font-bold text-black
                       bg-gradient-to-r from-[var(--color-accent-primary)] to-red-500
                       shadow-[0_10px_30px_rgba(245,158,11,0.35)]
                       hover:brightness-110 active:scale-[0.98]
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting up…' : step === 3 ? 'Start exploring →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
