import type { Character } from '../types/character'
import { cleanList } from './hasFilmsOrTvShows'

// What we save for each favorite: enough to show its card, and its expanded details
// (Films and TV Shows), on the Favorites page without calling the API
export interface FavoriteCharacter {
  _id: number
  name: string
  imageUrl?: string
  films?: string[]
  tvShows?: string[]
}

export const FAVORITES_STORAGE_KEY = 'disney-catalog-favorites'

// Only the parts of localStorage we use, so tests can pass a simple fake
export type FavoritesStorage = Pick<Storage, 'getItem' | 'setItem'>

function toFavorite(character: Character | FavoriteCharacter): FavoriteCharacter {
  const favorite: FavoriteCharacter = { _id: character._id, name: character.name }
  if (character.imageUrl) {
    favorite.imageUrl = character.imageUrl
  }
  // Only the two categories the expanded card shows; empty lists aren't saved
  const films = cleanList(character.films)
  const tvShows = cleanList(character.tvShows)
  if (films.length > 0) favorite.films = films
  if (tvShows.length > 0) favorite.tvShows = tvShows
  return favorite
}

function isListOfText(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function isFavorite(favorites: FavoriteCharacter[], id: number): boolean {
  return favorites.some((favorite) => favorite._id === id)
}

// Returns a new list with the character added at the end (never twice)
export function addFavorite(
  favorites: FavoriteCharacter[],
  character: Character | FavoriteCharacter,
): FavoriteCharacter[] {
  if (isFavorite(favorites, character._id)) return favorites
  return [...favorites, toFavorite(character)]
}

// Returns a new list without the character with this id
export function removeFavorite(favorites: FavoriteCharacter[], id: number): FavoriteCharacter[] {
  return favorites.filter((favorite) => favorite._id !== id)
}

// The heart button: adds the character if it isn't a favorite yet, removes it if it is
export function toggleFavorite(
  favorites: FavoriteCharacter[],
  character: Character | FavoriteCharacter,
): FavoriteCharacter[] {
  return isFavorite(favorites, character._id)
    ? removeFavorite(favorites, character._id)
    : addFavorite(favorites, character)
}

// Checks that something read from localStorage really looks like a saved favorite
function isSavedFavorite(value: unknown): value is FavoriteCharacter {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item._id === 'number' &&
    typeof item.name === 'string' &&
    (item.imageUrl === undefined || typeof item.imageUrl === 'string') &&
    (item.films === undefined || isListOfText(item.films)) &&
    (item.tvShows === undefined || isListOfText(item.tvShows))
  )
}

// Reads the saved favorites. Anything missing, broken, or edited by hand is ignored.
export function loadFavorites(storage: FavoritesStorage = localStorage): FavoriteCharacter[] {
  try {
    const saved = storage.getItem(FAVORITES_STORAGE_KEY)
    if (saved === null) return []

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    // Keep only valid entries, and each character only once
    return parsed.filter(isSavedFavorite).reduce<FavoriteCharacter[]>(addFavorite, [])
  } catch {
    // Not valid JSON, or the browser blocks localStorage (for example, some private windows)
    return []
  }
}

export function saveFavorites(
  favorites: FavoriteCharacter[],
  storage: FavoritesStorage = localStorage,
): void {
  try {
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // Storage is full or blocked: favorites still work until the page is closed
  }
}
