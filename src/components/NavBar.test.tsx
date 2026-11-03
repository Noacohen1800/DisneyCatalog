import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import NavBar from './NavBar'

const PAGES = [
  { name: 'Catalog', href: '/characters' },
  { name: 'Favorites', href: '/favorites' },
  { name: 'Random', href: '/random' },
]

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <NavBar />
    </MemoryRouter>,
  )
  return within(screen.getByRole('navigation', { name: 'Main' }))
}

// Which navigation links are marked as "the page we are on"
function activePages(nav: ReturnType<typeof renderAt>): string[] {
  return PAGES.filter(
    (page) => nav.getByRole('link', { name: page.name }).getAttribute('aria-current') === 'page',
  ).map((page) => page.name)
}

afterEach(cleanup)

describe('NavBar', () => {
  it('links to the three pages', () => {
    const nav = renderAt('/characters')

    expect(nav.getAllByRole('link')).toHaveLength(3)
    for (const page of PAGES) {
      expect(nav.getByRole('link', { name: page.name }).getAttribute('href')).toBe(page.href)
    }
  })

  it('shows the site name, which leads back to the catalog', () => {
    renderAt('/favorites')

    const brand = screen.getByRole('link', { name: 'Disney Catalog' })
    expect(brand.getAttribute('href')).toBe('/characters')
    // The site name is not a menu item, so it is never marked as the current page
    expect(brand.getAttribute('aria-current')).toBeNull()
  })

  it('highlights only the page we are on, including while a card is open', () => {
    expect(activePages(renderAt('/favorites'))).toEqual(['Favorites'])
    cleanup()
    // An open card's URL is still part of the catalog
    expect(activePages(renderAt('/characters/4703'))).toEqual(['Catalog'])
    cleanup()
    expect(activePages(renderAt('/favorites/2099'))).toEqual(['Favorites'])
    cleanup()
    expect(activePages(renderAt('/random'))).toEqual(['Random'])
  })
})
