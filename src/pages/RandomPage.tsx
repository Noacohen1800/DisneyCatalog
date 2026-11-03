import { useEffect, useRef, useState } from 'react'
import CharacterCard from '../components/CharacterCard'
import MysterySilhouette from '../components/MysterySilhouette'
import RevealSparkles from '../components/RevealSparkles'
import { useFavorites } from '../hooks/useFavorites'
import type { Character, CharacterListResponse } from '../types/character'
import { API_URL, toCharacterList } from '../utils/characterApi'
import { hasFilmsOrTvShows } from '../utils/hasFilmsOrTvShows'
import { pickRandomPosition } from '../utils/pickRandomPosition'
import './RandomPage.css'

// How long the reveal animation plays at least, even if the API answers sooner
const REVEAL_ANIMATION_MS = 1600
// About 1 in 10 characters has no films or TV shows. Those are skipped (the catalog
// doesn't show them, so "View Details" couldn't open them). Give up after this many tries.
const MAX_ATTEMPTS = 8

type RevealPhase = 'mystery' | 'revealing' | 'revealed' | 'error'

interface RandomPageProps {
  // Tests set this to 0 so they don't have to wait for the animation
  revealDelayMs?: number
}

// Asks the API for one page and returns its result (throws if the request fails)
async function fetchPage(url: string): Promise<CharacterListResponse> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json()
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function RandomPage({ revealDelayMs = REVEAL_ANIMATION_MS }: RandomPageProps) {
  const { isFavorite, toggleFavorite } = useFavorites()

  const [phase, setPhase] = useState<RevealPhase>('mystery')
  const [character, setCharacter] = useState<Character | null>(null)
  // True when the revealed character's card is open (its details show right here on /random)
  const [isExpanded, setIsExpanded] = useState(false)
  // Every click on "Reveal" or "Try Again" adds 1, which runs the effect below
  const [revealCount, setRevealCount] = useState(0)

  // Remembered between reveals, but changing them doesn't need to redraw the page:
  // the total number of characters (asked once), and the position and id of the character on screen
  const totalRef = useRef<number | null>(null)
  const currentPositionRef = useRef<number | undefined>(undefined)
  const currentIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    // Nothing to load until the first click
    if (revealCount === 0) return
    let ignore = false

    async function findRandomCharacter(): Promise<{ found: Character; position: number }> {
      // With one character per page, the number of pages is the number of characters
      if (totalRef.current === null) {
        const first = await fetchPage(`${API_URL}?page=1&pageSize=1`)
        totalRef.current = first.info.totalPages
      }
      const total = totalRef.current
      let skipPosition = currentPositionRef.current

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        // Never the position we are skipping, so the same character doesn't show twice in a row
        const position = pickRandomPosition(total, skipPosition)
        const result = await fetchPage(`${API_URL}?page=${position}&pageSize=1`)
        // With pageSize=1 the API sends a single object; past the end it sends an empty list
        const [candidate] = toCharacterList(result.data)

        if (candidate && hasFilmsOrTvShows(candidate) && candidate._id !== currentIdRef.current) {
          return { found: candidate, position }
        }
        // Not usable: try another position (and don't pick this one again right away)
        skipPosition = position
      }
      throw new Error('No character with films or TV shows was found')
    }

    async function reveal() {
      try {
        // Wait for both the API and the animation, so the reveal never feels cut short
        const [{ found, position }] = await Promise.all([findRandomCharacter(), wait(revealDelayMs)])
        if (ignore) return
        // Remember what is on screen now, so "Try Again" picks someone else
        currentPositionRef.current = position
        currentIdRef.current = found._id
        setCharacter(found)
        setPhase('revealed')
      } catch {
        if (!ignore) setPhase('error')
      }
    }

    reveal()
    return () => {
      ignore = true
    }
  }, [revealCount, revealDelayMs])

  function startReveal() {
    setPhase('revealing')
    // Every new character starts with its card closed
    setIsExpanded(false)
    setRevealCount((count) => count + 1)
  }

  return (
    <main className="app random-page">
      <h1 className="app__title">Mystery Character</h1>

      {phase === 'mystery' && (
        <section className="random-page__stage">
          <MysterySilhouette isRevealing={false} />
          <p className="random-page__hint">Who will it be? Tap to find out!</p>
          <button type="button" className="button reveal-button" onClick={startReveal}>
            Reveal Character
          </button>
        </section>
      )}

      {phase === 'revealing' && (
        <section className="random-page__stage" aria-live="polite">
          <MysterySilhouette isRevealing />
          <p className="random-page__hint">Summoning a Disney character…</p>
        </section>
      )}

      {phase === 'error' && (
        <section className="random-page__stage">
          <MysterySilhouette isRevealing={false} />
          <p className="status-message status-message--error" role="alert">
            The magic didn't work this time. Check your internet connection and try again.
          </p>
          <button type="button" className="button reveal-button" onClick={startReveal}>
            Try Again
          </button>
        </section>
      )}

      {phase === 'revealed' && character && (
        <section className="random-page__stage" aria-live="polite">
          {/* "key" makes the entrance and sparkles play again for every new character */}
          <div key={character._id} className="random-page__reveal">
            {/* The same expandable card as the catalog, but it opens and closes
                right here on /random instead of going to another page */}
            <CharacterCard
              character={character}
              isExpanded={isExpanded}
              isFavorite={isFavorite(character._id)}
              onToggleFavorite={() => toggleFavorite(character)}
              onOpen={() => setIsExpanded(true)}
              onClose={() => setIsExpanded(false)}
            />
            <RevealSparkles />
          </div>

          <div className="random-page__actions">
            <button type="button" className="button reveal-button" onClick={startReveal}>
              Try Again
            </button>
            {/* Once the card is open, its ✕ button closes it */}
            {!isExpanded && (
              <button
                type="button"
                className="button button--outline"
                onClick={() => setIsExpanded(true)}
              >
                View Details
              </button>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

export default RandomPage
