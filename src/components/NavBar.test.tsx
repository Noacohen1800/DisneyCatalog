import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import NavBar from './NavBar'

function activeLinkAt(path: string): string[] {
  render(
    <MemoryRouter initialEntries={[path]}>
      <NavBar />
    </MemoryRouter>,
  )
  return screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
    .map((link) => link.textContent ?? '')
}

afterEach(cleanup)

describe('NavBar', () => {
  it('links to the three pages', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    const links = screen.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])
    expect(links).toEqual([
      ['Catalog', '/characters'],
      ['Favorites', '/favorites'],
      ['Random', '/random'],
    ])
  })

  it('highlights only the page we are on, including Catalog when a card is open', () => {
    expect(activeLinkAt('/favorites')).toEqual(['Favorites'])
    cleanup()
    // An open card's URL is still part of the catalog
    expect(activeLinkAt('/characters/4703')).toEqual(['Catalog'])
  })
})
