import { describe, expect, it } from 'vitest'
import type { Character } from '../types/character'
import { getCharacterCategories } from './getCharacterCategories'

describe('getCharacterCategories (expanded card details)', () => {
  it('returns only Films and TV Shows, in that order, and ignores every other category', () => {
    const stitch: Character = {
      _id: 6448,
      name: 'Stitch',
      films: ['Lilo & Stitch'],
      tvShows: ['Stitch!'],
      videoGames: ['Disney Speedstorm'],
      allies: ['Lilo'],
      enemies: ['Gantu'],
      parkAttractions: ["Stitch's Great Escape!"],
    }

    expect(getCharacterCategories(stitch)).toEqual([
      { title: 'Films', items: ['Lilo & Stitch'] },
      { title: 'TV Shows', items: ['Stitch!'] },
    ])
  })

  it('hides a category that is empty, and removes blank entries from the lists', () => {
    const achilles: Character = {
      _id: 112,
      name: 'Achilles',
      films: ['Hercules (film)', ''],
      tvShows: [],
    }

    expect(getCharacterCategories(achilles)).toEqual([
      { title: 'Films', items: ['Hercules (film)'] },
    ])
  })

  it("doesn't crash when the API leaves fields out, and returns no categories", () => {
    const noLists: Character = { _id: 293, name: 'Arabella' }
    expect(getCharacterCategories(noLists)).toEqual([])
  })
})
