import { describe, expect, it } from 'vitest'
import type { Character } from '../types/character'
import { hasFilmsOrTvShows } from './hasFilmsOrTvShows'

function makeCharacter(fields: Partial<Character>): Character {
  return { _id: 1, name: 'Test Character', ...fields }
}

describe('hasFilmsOrTvShows (catalog filter)', () => {
  it('keeps characters with films only, TV shows only, or both', () => {
    expect(hasFilmsOrTvShows(makeCharacter({ films: ['Frozen'], tvShows: [] }))).toBe(true)
    expect(hasFilmsOrTvShows(makeCharacter({ films: [], tvShows: ['House of Mouse'] }))).toBe(true)
    expect(hasFilmsOrTvShows(makeCharacter({ films: ['Frozen'], tvShows: ['Sofia the First'] }))).toBe(true)
  })

  it('removes characters whose films and TV shows are empty or missing', () => {
    expect(hasFilmsOrTvShows(makeCharacter({ films: [], tvShows: [] }))).toBe(false)
    // The API sometimes leaves fields out completely
    expect(hasFilmsOrTvShows(makeCharacter({}))).toBe(false)
  })

  it('ignores other categories: a character only in video games or parks is removed', () => {
    const aqua = makeCharacter({
      films: [],
      tvShows: [],
      videoGames: ['Kingdom Hearts III'],
      parkAttractions: ['Tower of Terror'],
    })
    expect(hasFilmsOrTvShows(aqua)).toBe(false)
  })

  it('treats blank entries as empty', () => {
    expect(hasFilmsOrTvShows(makeCharacter({ films: ['', '   '], tvShows: [''] }))).toBe(false)
    expect(hasFilmsOrTvShows(makeCharacter({ films: ['  '], tvShows: ['DuckTales'] }))).toBe(true)
  })
})
