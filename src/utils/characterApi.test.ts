import { describe, expect, it } from 'vitest'
import type { Character } from '../types/character'
import { buildCharactersUrl, toCharacterList } from './characterApi'

// Reads the query part of a URL into a plain object, so the tests don't depend on parameter order
function paramsOf(url: string): Record<string, string> {
  return Object.fromEntries(new URL(url).searchParams)
}

describe('buildCharactersUrl (search and pagination requests)', () => {
  it('asks for the normal catalog when there is no search text', () => {
    expect(paramsOf(buildCharactersUrl(1))).toEqual({ page: '1', pageSize: '50' })
    // Only spaces counts as no search
    expect(paramsOf(buildCharactersUrl(1, '   '))).toEqual({ page: '1', pageSize: '50' })
  })

  it('keeps the search name on every page, so "Load more" stays inside the search results', () => {
    expect(paramsOf(buildCharactersUrl(3, 'mi'))).toEqual({ page: '3', pageSize: '50', name: 'mi' })
  })

  it('trims spaces, because the API returns different results for "Elsa " and "Elsa"', () => {
    expect(paramsOf(buildCharactersUrl(1, '  Elsa  ')).name).toBe('Elsa')
  })

  it('encodes special characters so they don\'t break the URL', () => {
    const url = buildCharactersUrl(1, 'Lilo & Stitch')

    // "&" must not start a new parameter
    expect(paramsOf(url)).toEqual({ page: '1', pageSize: '50', name: 'Lilo & Stitch' })
    expect(url).not.toContain('& Stitch')
  })
})

describe('toCharacterList (the API sends one object when exactly one character matches)', () => {
  const elsa: Character = { _id: 2099, name: 'Elsa', films: ['Frozen'] }
  const anna: Character = { _id: 270, name: 'Anna', films: ['Frozen'] }

  it('returns a list unchanged', () => {
    const list = [elsa, anna]
    expect(toCharacterList(list)).toBe(list)
  })

  it('wraps a single character in a list', () => {
    expect(toCharacterList(elsa)).toEqual([elsa])
  })

  it('keeps an empty list (no matches) empty', () => {
    expect(toCharacterList([])).toEqual([])
  })
})
