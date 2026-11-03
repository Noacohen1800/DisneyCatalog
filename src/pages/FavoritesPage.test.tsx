import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Character, CharacterListResponse } from '../types/character'
import { FAVORITES_STORAGE_KEY } from '../utils/favorites'
import CatalogPage from './CatalogPage'
import FavoritesPage from './FavoritesPage'

const mickey: Character = { _id: 4703, name: 'Mickey Mouse', imageUrl: 'https://example.com/mickey.png', films: ['Fantasia'] }
const goofy: Character = { _id: 2727, name: 'Goofy', tvShows: ['House of Mouse'] }

// A fake Disney API that always returns the same page
const fetchMock = vi.fn(() => {
  const body: CharacterListResponse = {
    info: { count: 2, totalPages: 1, previousPage: null, nextPage: null },
    data: [mickey, goofy],
  }
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) })
})

// Shows the current URL, so tests can check where a click led
function CurrentPath() {
  return <p data-testid="current-path">{useLocation().pathname}</p>
}

function currentPath(): string {
  return screen.getByTestId('current-path').textContent ?? ''
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CurrentPath />
      <Routes>
        <Route path="/characters" element={<CatalogPage />} />
        <Route path="/characters/:id" element={<CatalogPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/favorites/:id" element={<FavoritesPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function savedFavorites(): unknown {
  return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? 'null')
}

function cardNames(): string[] {
  return screen.queryAllByRole('heading', { level: 2 }).map((heading) => heading.textContent ?? '')
}

beforeEach(() => {
  // jsdom has no scrolling, but an expanded card scrolls itself into view
  Element.prototype.scrollIntoView = vi.fn()
  localStorage.clear()
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Favorites', () => {
  it('fills the heart on the catalog, saves to localStorage, and stays filled after a refresh', async () => {
    renderAt('/characters')
    const heart = await screen.findByRole('button', { name: 'Add Mickey Mouse to favorites' })
    expect(heart.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(heart)

    const filledHeart = screen.getByRole('button', { name: 'Remove Mickey Mouse from favorites' })
    expect(filledHeart.getAttribute('aria-pressed')).toBe('true')
    await waitFor(() =>
      expect(savedFavorites()).toEqual([
        { _id: 4703, name: 'Mickey Mouse', imageUrl: 'https://example.com/mickey.png', films: ['Fantasia'] },
      ]),
    )

    // "Refresh": throw the page away and render it again from scratch
    cleanup()
    renderAt('/characters')

    const heartAfterRefresh = await screen.findByRole('button', { name: 'Remove Mickey Mouse from favorites' })
    expect(heartAfterRefresh.getAttribute('aria-pressed')).toBe('true')
    // Goofy was never added
    expect(screen.getByRole('button', { name: 'Add Goofy to favorites' })).toBeTruthy()
  })

  it("clicking the heart doesn't open the character's card", async () => {
    renderAt('/characters')

    fireEvent.click(await screen.findByRole('button', { name: 'Add Goofy to favorites' }))

    // An open card has a "Close details" button; none should appear
    expect(screen.queryByRole('button', { name: 'Close details' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Close details' })).toBeNull()
  })

  it('lists saved favorites without calling the API, and removes a card when its heart is clicked', async () => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([
        { _id: 4703, name: 'Mickey Mouse' },
        { _id: 2727, name: 'Goofy' },
      ]),
    )
    renderAt('/favorites')

    expect(cardNames()).toEqual(['Mickey Mouse', 'Goofy'])
    expect(fetchMock).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Remove Mickey Mouse from favorites' }))

    expect(cardNames()).toEqual(['Goofy'])
    await waitFor(() => expect(savedFavorites()).toEqual([{ _id: 2727, name: 'Goofy' }]))
  })

  it('shows a friendly message with a link to the catalog when there are no favorites', () => {
    renderAt('/favorites')

    expect(screen.getByText(/You haven't saved a favorite yet/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Browse characters' }).getAttribute('href')).toBe('/characters')
  })

  it('shows the empty message after the last favorite is removed', async () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([{ _id: 2727, name: 'Goofy' }]))
    renderAt('/favorites')

    fireEvent.click(screen.getByRole('button', { name: 'Remove Goofy from favorites' }))

    expect(screen.getByText(/You haven't saved a favorite yet/)).toBeTruthy()
    await waitFor(() => expect(savedFavorites()).toEqual([]))
  })
})

describe('Expanding a card on the Favorites page', () => {
  beforeEach(() => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([
        { _id: 4703, name: 'Mickey Mouse', films: ['Fantasia'] },
        { _id: 2727, name: 'Goofy', tvShows: ['House of Mouse'] },
      ]),
    )
  })

  it('opens the card on the Favorites page with its films and TV shows, without calling the API', () => {
    renderAt('/favorites')

    fireEvent.click(screen.getByRole('link', { name: /Goofy/ }))

    expect(currentPath()).toBe('/favorites/2727')
    expect(screen.getByRole('heading', { name: 'My Favorites' })).toBeTruthy()
    expect(screen.getByText('TV Shows')).toBeTruthy()
    expect(screen.getByText('House of Mouse')).toBeTruthy()
    // Goofy has no films saved, so that section is hidden
    expect(screen.queryByText('Films')).toBeNull()
    // The other favorite is still visible and closed
    expect(cardNames()).toEqual(['Mickey Mouse', 'Goofy'])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('closes the card with ✕ and stays on the Favorites page', () => {
    renderAt('/favorites/4703')
    expect(screen.getByText('Fantasia')).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Close details' }))

    expect(currentPath()).toBe('/favorites')
    expect(screen.queryByText('Fantasia')).toBeNull()
    expect(cardNames()).toEqual(['Mickey Mouse', 'Goofy'])
  })

  it('removes a favorite from its expanded card, closing it and saving the change', async () => {
    renderAt('/favorites/4703')

    fireEvent.click(screen.getByRole('button', { name: 'Remove Mickey Mouse from favorites' }))

    expect(currentPath()).toBe('/favorites')
    expect(cardNames()).toEqual(['Goofy'])
    await waitFor(() =>
      expect(savedFavorites()).toEqual([{ _id: 2727, name: 'Goofy', tvShows: ['House of Mouse'] }]),
    )
  })

  it('goes to the Favorites list when the link is to a character that is not a favorite', () => {
    renderAt('/favorites/99999')

    expect(currentPath()).toBe('/favorites')
    expect(cardNames()).toEqual(['Mickey Mouse', 'Goofy'])
  })
})
