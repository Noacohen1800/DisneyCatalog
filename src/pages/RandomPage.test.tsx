import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Character, CharacterListResponse } from '../types/character'
import { FAVORITES_STORAGE_KEY } from '../utils/favorites'
import RandomPage from './RandomPage'

const elsa: Character = { _id: 2099, name: 'Elsa', films: ['Frozen'] }
const stitch: Character = { _id: 6448, name: 'Stitch', tvShows: ['Stitch!'] }
const baloo: Character = { _id: 450, name: 'Baloo', films: ['The Jungle Book'] }
// In the API, but without films or TV shows, so the catalog doesn't show it
const aqua: Character = { _id: 291, name: 'Aqua', films: [], tvShows: [], videoGames: ['Kingdom Hearts III'] }

// The characters our fake API knows. With pageSize=1, page N is the Nth character.
let allCharacters: Character[] = []
// Set to true to make every request fail, like being offline
let offline = false

const fetchMock = vi.fn((url: string) => {
  if (offline) return Promise.reject(new TypeError('Failed to fetch'))

  const page = Number(new URL(url).searchParams.get('page'))
  const character = allCharacters[page - 1]
  const body: CharacterListResponse = {
    info: { count: character ? 1 : 0, totalPages: allCharacters.length, previousPage: null, nextPage: null },
    // Like the real API: one object for one result, an empty list past the end
    data: character ?? [],
  }
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) })
})

// Shows the current URL, so tests can check that the user stays on /random
function CurrentPath() {
  return <p data-testid="current-path">{useLocation().pathname}</p>
}

function currentPath(): string {
  return screen.getByTestId('current-path').textContent ?? ''
}

function renderRandomPage() {
  render(
    <MemoryRouter initialEntries={['/random']}>
      <CurrentPath />
      {/* No animation delay in tests */}
      <RandomPage revealDelayMs={0} />
    </MemoryRouter>,
  )
}

// Reveal one known character and wait until its card is on screen
async function revealOnly(character: Character) {
  allCharacters = [character]
  renderRandomPage()
  clickButton('Reveal Character')
  await revealedName()
}

// The name on the revealed card
async function revealedName(): Promise<string> {
  const heading = await screen.findByRole('heading', { level: 2 })
  return heading.textContent ?? ''
}

function clickButton(name: string) {
  fireEvent.click(screen.getByRole('button', { name }))
}

// The "page" asked for in each character request (not the first request, which reads the total)
function requestedPositions(): number[] {
  return fetchMock.mock.calls.slice(1).map(([url]) => Number(new URL(url).searchParams.get('page')))
}

beforeEach(() => {
  // jsdom has no scrolling, but an expanded card scrolls itself into view
  Element.prototype.scrollIntoView = vi.fn()
  allCharacters = [elsa, stitch, baloo]
  offline = false
  localStorage.clear()
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Random page: Mystery Reveal', () => {
  it('starts with a mystery silhouette and a Reveal button, without calling the API', () => {
    renderRandomPage()

    expect(screen.getByRole('img', { name: 'A mystery character' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reveal Character' })).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('plays the reveal, then shows a random character with its sparkles and a View Details button', async () => {
    renderRandomPage()

    clickButton('Reveal Character')

    // The animation and loading message show while the character is on its way
    expect(screen.getByRole('img', { name: 'Revealing a mystery character' })).toBeTruthy()
    expect(screen.getByText('Summoning a Disney character…')).toBeTruthy()

    const name = await revealedName()
    const revealed = allCharacters.find((character) => character.name === name)
    expect(revealed).toBeDefined()
    expect(screen.getByTestId('reveal-sparkles')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'View Details' })).toBeTruthy()
    // The mystery silhouette is gone once the character is revealed
    expect(screen.queryByRole('img', { name: /mystery character/ })).toBeNull()
    // Every request asks for one character at a time
    for (const [url] of fetchMock.mock.calls) {
      expect(new URL(url).searchParams.get('pageSize')).toBe('1')
    }
  })

  it('reads the total once, then asks for a position inside it', async () => {
    renderRandomPage()

    clickButton('Reveal Character')
    await revealedName()
    clickButton('Try Again')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))

    // 1 request for the total, then 1 per reveal
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get('page')).toBe('1')
    for (const position of requestedPositions()) {
      expect(position).toBeGreaterThanOrEqual(1)
      expect(position).toBeLessThanOrEqual(3)
    }
  })

  it('"Try Again" never shows the same character twice in a row', async () => {
    renderRandomPage()
    clickButton('Reveal Character')
    const names = [await revealedName()]

    for (let i = 0; i < 12; i++) {
      clickButton('Try Again')
      await waitFor(() => expect(screen.queryByText('Summoning a Disney character…')).toBeNull())
      names.push(await revealedName())
    }

    for (let i = 1; i < names.length; i++) {
      expect(names[i]).not.toBe(names[i - 1])
    }
  })

  it('skips characters without films or TV shows, so View Details always works', async () => {
    allCharacters = [aqua, elsa]
    // The first random pick is position 1 (Aqua); the next one must be a different position
    vi.spyOn(Math, 'random').mockReturnValue(0)
    renderRandomPage()

    clickButton('Reveal Character')

    expect(await revealedName()).toBe('Elsa')
    expect(screen.queryByText('Aqua')).toBeNull()
    expect(requestedPositions()).toEqual([1, 2])
  })

  it('adds the revealed character to favorites and removes it again', async () => {
    allCharacters = [stitch]
    renderRandomPage()
    clickButton('Reveal Character')
    await revealedName()

    clickButton('Add Stitch to favorites')

    expect(screen.getByRole('button', { name: 'Remove Stitch from favorites' }).getAttribute('aria-pressed')).toBe('true')
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]')).toEqual([
        { _id: 6448, name: 'Stitch', tvShows: ['Stitch!'] },
      ]),
    )

    clickButton('Remove Stitch from favorites')

    await waitFor(() => expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]')).toEqual([]))
  })

  it('shows an error when the API fails, and "Try Again" recovers', async () => {
    offline = true
    renderRandomPage()

    clickButton('Reveal Character')

    expect((await screen.findByRole('alert')).textContent).toMatch(/didn't work/)

    offline = false
    clickButton('Try Again')

    expect(allCharacters.map((character) => character.name)).toContain(await revealedName())
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('gives up with an error instead of trying forever when no usable character is found', async () => {
    allCharacters = [aqua, { ...aqua, _id: 292, name: 'Aqua 2' }]
    renderRandomPage()

    clickButton('Reveal Character')

    expect(await screen.findByRole('alert')).toBeTruthy()
    // 1 request for the total + 8 tries
    expect(fetchMock).toHaveBeenCalledTimes(9)
  })
})

describe('Random page: details of the revealed character', () => {
  const mickey: Character = {
    _id: 4703,
    name: 'Mickey Mouse',
    films: ['Fantasia'],
    tvShows: ['House of Mouse'],
    videoGames: ['Epic Mickey'],
  }

  it('clicking the revealed card opens its details right here, staying on /random', async () => {
    await revealOnly(mickey)

    fireEvent.click(screen.getByRole('button', { name: 'Show details for Mickey Mouse' }))

    expect(currentPath()).toBe('/random')
    expect(screen.getByText('Fantasia')).toBeTruthy()
    expect(screen.getByText('House of Mouse')).toBeTruthy()
    // Same details as the catalog: only Films and TV Shows
    expect(screen.queryByText('Epic Mickey')).toBeNull()
    // No new API request is needed to show the details
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('opens with the keyboard too (Enter), like a real button', async () => {
    await revealOnly(mickey)

    fireEvent.keyDown(screen.getByRole('button', { name: 'Show details for Mickey Mouse' }), { key: 'Enter' })

    expect(screen.getByText('Fantasia')).toBeTruthy()
  })

  it('"View Details" opens the same card in place, and ✕ closes it, still on /random', async () => {
    await revealOnly(mickey)

    clickButton('View Details')

    expect(screen.getByText('Fantasia')).toBeTruthy()
    // While the card is open, its ✕ closes it, so "View Details" is hidden
    expect(screen.queryByRole('button', { name: 'View Details' })).toBeNull()

    clickButton('Close details')

    expect(screen.queryByText('Fantasia')).toBeNull()
    expect(screen.getByRole('button', { name: 'View Details' })).toBeTruthy()
    expect(currentPath()).toBe('/random')
  })

  it('the heart still works while the card is open', async () => {
    await revealOnly(mickey)
    clickButton('View Details')

    clickButton('Add Mickey Mouse to favorites')

    expect(screen.getByRole('button', { name: 'Remove Mickey Mouse from favorites' })).toBeTruthy()
    // Still open
    expect(screen.getByText('Fantasia')).toBeTruthy()
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]')).toEqual([
        { _id: 4703, name: 'Mickey Mouse', films: ['Fantasia'], tvShows: ['House of Mouse'] },
      ]),
    )
  })

  it('"Try Again" reveals the next character with its card closed and fresh sparkles', async () => {
    allCharacters = [mickey, elsa]
    renderRandomPage()
    clickButton('Reveal Character')
    const firstName = await revealedName()
    const firstSparkles = screen.getByTestId('reveal-sparkles')
    clickButton('View Details')

    clickButton('Try Again')
    await waitFor(() => expect(screen.queryByText('Summoning a Disney character…')).toBeNull())

    expect(await revealedName()).not.toBe(firstName)
    // The new card starts closed
    expect(screen.queryByRole('button', { name: 'Close details' })).toBeNull()
    expect(screen.getByRole('button', { name: 'View Details' })).toBeTruthy()
    // A new sparkle burst, not the old one left on screen
    expect(screen.getByTestId('reveal-sparkles')).not.toBe(firstSparkles)
  })
})
