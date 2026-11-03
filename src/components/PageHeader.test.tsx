import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PageHeader from './PageHeader'

afterEach(cleanup)

describe('PageHeader', () => {
  it('shows the page title as the main heading, with its tagline', () => {
    render(<PageHeader title="Disney Catalog" subtitle="Where every character has a little magic." size="hero" />)

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Disney Catalog')
    expect(screen.getByText('Where every character has a little magic.')).toBeTruthy()
  })

  it('leaves out the tagline when there is none, and keeps the sparkles hidden from screen readers', () => {
    const { container } = render(<PageHeader title="My Favorites" />)

    expect(container.querySelector('.page-header__subtitle')).toBeNull()
    // The decorative stars are not read aloud
    for (const decoration of container.querySelectorAll('.page-header__sparkle, .page-header__divider')) {
      expect(decoration.getAttribute('aria-hidden')).toBe('true')
    }
  })
})
