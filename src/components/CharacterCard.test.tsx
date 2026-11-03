import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Character } from '../types/character'
import CharacterCard from './CharacterCard'

const PLACEHOLDER = '/placeholder.svg'
const IMAGE_URL = 'https://static.wikia.nocookie.net/disney/images/test.png'

// CharacterCard contains a Link, so it needs a router around it
function renderCard(character: Character) {
  render(
    <MemoryRouter>
      <CharacterCard character={character} isExpanded={false} />
    </MemoryRouter>,
  )
  return screen.getByRole('img', { name: character.name })
}

// jsdom doesn't really load images, so we set the size ourselves and fire "load"
function finishLoading(image: HTMLElement, width: number, height: number) {
  Object.defineProperty(image, 'naturalWidth', { value: width })
  Object.defineProperty(image, 'naturalHeight', { value: height })
  fireEvent.load(image)
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('CharacterCard image fallback', () => {
  it('shows the Mickey placeholder when the character has no image URL', () => {
    const image = renderCard({ _id: 1, name: 'No Image Character' })
    expect(image.getAttribute('src')).toBe(PLACEHOLDER)
  })

  it('switches to the placeholder when the image fails to load', () => {
    const image = renderCard({ _id: 2, name: 'Broken Link', imageUrl: IMAGE_URL })
    expect(image.getAttribute('src')).toBe(IMAGE_URL)

    fireEvent.error(image)

    expect(image.getAttribute('src')).toBe(PLACEHOLDER)
  })

  it('replaces a 300x171 image when the server confirms it is a "not found" answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    vi.stubGlobal('fetch', fetchMock)
    const image = renderCard({ _id: 3, name: 'Missing On Wiki', imageUrl: IMAGE_URL })

    finishLoading(image, 300, 171)

    await waitFor(() => expect(image.getAttribute('src')).toBe(PLACEHOLDER))
    expect(fetchMock).toHaveBeenCalledWith(IMAGE_URL, { method: 'HEAD' })
  })

  it('keeps a real 300x171 image when the server says it exists', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)
    const image = renderCard({ _id: 4, name: 'Real Small Image', imageUrl: IMAGE_URL })

    finishLoading(image, 300, 171)

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(image.getAttribute('src')).toBe(IMAGE_URL)
  })

  it("doesn't check with the server for images of a different size", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const image = renderCard({ _id: 5, name: 'Normal Image', imageUrl: IMAGE_URL })

    finishLoading(image, 400, 400)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(image.getAttribute('src')).toBe(IMAGE_URL)
  })
})
