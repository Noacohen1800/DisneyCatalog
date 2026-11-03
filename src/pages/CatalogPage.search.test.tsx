import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Character, CharacterListResponse } from '../types/character'
import CatalogPage from './CatalogPage'

const mickey: Character = { _id: 4703, name: 'Mickey Mouse', films: ['Fantasia'], tvShows: [] }
const goofy: Character = { _id: 2727, name: 'Goofy', films: [], tvShows: ['House of Mouse'] }
// Matches the search, but has no films or TV shows, so the catalog filter hides it
const mickeyGame: Character = { _id: 9001, name: 'Mickey Robot', films: [], tvShows: [], videoGames: ['Epic Mickey'] }
const elsa: Character = { _id: 2099, name: 'Elsa', films: ['Frozen'], tvShows: [] }

function apiAnswer(data: Character | Character[], nextPage: string | null = null): CharacterListResponse {
  const count = Array.isArray(data) ? data.length : 1
  return { info: { count, totalPages: 1, previousPage: null, nextPage }, data }
}

function okResponse(body: CharacterListResponse) {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) })
}

// A fake Disney API: answers according to the "name" in the URL
const fetchMock = vi.fn((url: string) => {
  const name = new URL(url).searchParams.get('name')

  if (name === null) return okResponse(apiAnswer([mickey, goofy], 'page-2-url'))
  if (name === 'mickey') return okResponse(apiAnswer([mickey, mickeyGame]))
  if (name === 'Elsa') return okResponse(apiAnswer(elsa)) // one match: a single object
  if (name === 'offline') {
    // Fail after a short moment, like a real network error, so the loading message is visible first
    return new Promise((_, reject) => setTimeout(() => reject(new TypeError('Failed to fetch')), 100))
  }
  return okResponse(apiAnswer([])) // no matches
})

function renderCatalog() {
  render(
    <MemoryRouter initialEntries={['/characters']}>
      <Routes>
        <Route path="/characters" element={<CatalogPage />} />
        <Route path="/characters/:id" element={<CatalogPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function typeInSearch(text: string) {
  fireEvent.change(screen.getByLabelText('Search characters by name'), { target: { value: text } })
}

// Each card shows the character's name as a heading
function cardNames(): string[] {
  return screen.queryAllByRole('heading', { level: 2 }).map((heading) => heading.textContent ?? '')
}

beforeEach(() => {
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Catalog search', () => {
  it('searches the API by name and shows only matching characters that pass the catalog filter', async () => {
    renderCatalog()
    await screen.findByRole('heading', { name: 'Goofy' })

    typeInSearch('mickey')

    await waitFor(() => expect(cardNames()).toEqual(['Mickey Mouse']))
    // Mickey Robot matched the search but has no films or TV shows
    expect(screen.queryByText('Mickey Robot')).toBeNull()
    const searchUrl = fetchMock.mock.calls.at(-1)?.[0] ?? ''
    expect(new URL(searchUrl).searchParams.get('name')).toBe('mickey')
    // The search results fit on one page, so there is no "Load more"
    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull()
  })

  it('shows one card when the API answers with a single character instead of a list', async () => {
    renderCatalog()
    await screen.findByRole('heading', { name: 'Goofy' })

    typeInSearch('  Elsa ')

    await waitFor(() => expect(cardNames()).toEqual(['Elsa']))
  })

  it('shows a "no characters found" message when nothing matches', async () => {
    renderCatalog()
    await screen.findByRole('heading', { name: 'Goofy' })

    typeInSearch('zzqqxx')

    expect(await screen.findByText('No characters found for "zzqqxx".')).toBeTruthy()
    expect(cardNames()).toEqual([])
  })

  it('shows a loading message while searching and an error message when the search request fails', async () => {
    renderCatalog()
    await screen.findByRole('heading', { name: 'Goofy' })

    typeInSearch('offline')

    expect(await screen.findByText('Searching for "offline"…')).toBeTruthy()
    expect(await screen.findByText(/Couldn't search for "offline"/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
  })

  it('waits until the user stops typing, then sends only one search request', async () => {
    renderCatalog()
    await screen.findByRole('heading', { name: 'Goofy' })
    const requestsBefore = fetchMock.mock.calls.length

    typeInSearch('m')
    typeInSearch('mi')
    typeInSearch('mic')
    typeInSearch('mickey')

    await waitFor(() => expect(cardNames()).toEqual(['Mickey Mouse']))
    expect(fetchMock.mock.calls.length - requestsBefore).toBe(1)
  })

  it('brings the normal catalog back when the search is cleared', async () => {
    renderCatalog()
    await screen.findByRole('heading', { name: 'Goofy' })
    typeInSearch('mickey')
    await waitFor(() => expect(cardNames()).toEqual(['Mickey Mouse']))

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    await waitFor(() => expect(cardNames()).toEqual(['Mickey Mouse', 'Goofy']))
    expect(screen.getByRole('button', { name: 'Load more' })).toBeTruthy()
  })
})
