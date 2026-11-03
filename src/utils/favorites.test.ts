import { describe, expect, it } from 'vitest'
import type { Character } from '../types/character'
import type { FavoriteCharacter, FavoritesStorage } from './favorites'
import {
  FAVORITES_STORAGE_KEY,
  addFavorite,
  loadFavorites,
  removeFavorite,
  saveFavorites,
  toggleFavorite,
} from './favorites'

const elsa: Character = {
  _id: 2099,
  name: 'Elsa',
  imageUrl: 'https://example.com/elsa.png',
  films: ['Frozen'],
  tvShows: ['Sofia the First'],
}
const stitch: Character = { _id: 6448, name: 'Stitch', films: ['Lilo & Stitch'] }

// A tiny in-memory stand-in for localStorage
function makeStorage(initial: Record<string, string> = {}): FavoritesStorage & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value
    },
  }
}

describe('favorites list helpers', () => {
  it('adds a character, saving only what the Favorites page shows: id, name, image, films, TV shows', () => {
    const result = addFavorite([], { ...elsa, videoGames: ['Disney Speedstorm'], allies: ['Anna'] })

    expect(result).toEqual([
      {
        _id: 2099,
        name: 'Elsa',
        imageUrl: 'https://example.com/elsa.png',
        films: ['Frozen'],
        tvShows: ['Sofia the First'],
      },
    ])
  })

  it("doesn't save empty or blank film and TV show lists", () => {
    const result = addFavorite([], { _id: 112, name: 'Achilles', films: ['Hercules (film)', ''], tvShows: [] })

    expect(result).toEqual([{ _id: 112, name: 'Achilles', films: ['Hercules (film)'] }])
  })

  it('keeps only one copy when the same character is added twice', () => {
    const once = addFavorite([], elsa)
    const twice = addFavorite(once, elsa)

    expect(twice).toHaveLength(1)
    // Nothing changed, so React gets the same list back and doesn't re-render
    expect(twice).toBe(once)
  })

  it('removes only the chosen character and keeps the order of the rest', () => {
    const favorites = addFavorite(addFavorite([], elsa), stitch)

    expect(removeFavorite(favorites, 2099).map((favorite) => favorite.name)).toEqual(['Stitch'])
    // Removing a character that isn't saved leaves the list as it was
    expect(removeFavorite(favorites, 1).map((favorite) => favorite.name)).toEqual(['Elsa', 'Stitch'])
  })

  it('toggles: the first click adds, the second click removes', () => {
    const afterFirstClick = toggleFavorite([], stitch)
    const afterSecondClick = toggleFavorite(afterFirstClick, stitch)

    expect(afterFirstClick.map((favorite) => favorite._id)).toEqual([6448])
    expect(afterSecondClick).toEqual([])
  })

  it("doesn't change the list it was given (React state must not be changed directly)", () => {
    const favorites: FavoriteCharacter[] = [{ _id: 2099, name: 'Elsa' }]

    toggleFavorite(favorites, stitch)
    removeFavorite(favorites, 2099)

    expect(favorites).toEqual([{ _id: 2099, name: 'Elsa' }])
  })
})

describe('saving favorites in localStorage', () => {
  it('reads back exactly what was saved (what happens on a page refresh)', () => {
    const storage = makeStorage()
    const favorites = addFavorite(addFavorite([], elsa), stitch)

    saveFavorites(favorites, storage)

    expect(loadFavorites(storage)).toEqual(favorites)
  })

  it('starts with an empty list when nothing is saved yet', () => {
    expect(loadFavorites(makeStorage())).toEqual([])
  })

  it('ignores saved data that is broken or edited by hand instead of crashing', () => {
    expect(loadFavorites(makeStorage({ [FAVORITES_STORAGE_KEY]: 'not json {' }))).toEqual([])
    expect(loadFavorites(makeStorage({ [FAVORITES_STORAGE_KEY]: '{"_id": 1}' }))).toEqual([])

    const mixed = JSON.stringify([
      { _id: 2099, name: 'Elsa' },
      { _id: 'abc', name: 'Bad id' },
      { _id: 7, name: 'Bad films', films: 'Frozen' },
      { _id: 8, name: 'Bad TV shows', tvShows: [1, 2] },
      { name: 'No id' },
      null,
      { _id: 2099, name: 'Elsa again' },
    ])
    expect(loadFavorites(makeStorage({ [FAVORITES_STORAGE_KEY]: mixed }))).toEqual([
      { _id: 2099, name: 'Elsa' },
    ])
  })

  it("doesn't crash when the browser blocks localStorage", () => {
    const blocked: FavoritesStorage = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }

    expect(loadFavorites(blocked)).toEqual([])
    expect(() => saveFavorites([{ _id: 1, name: 'Test' }], blocked)).not.toThrow()
  })
})
