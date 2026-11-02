import type { Character } from '../types/character'

// Removes blank entries (like "") from a list. A missing list becomes an empty list.
export function cleanList(items: string[] | undefined): string[] {
  return (items ?? []).filter((item) => item.trim() !== '')
}

// The catalog only shows characters that appear in at least one film or TV show.
// Characters with films only, or TV shows only, are kept.
export function hasFilmsOrTvShows(character: Character): boolean {
  return cleanList(character.films).length > 0 || cleanList(character.tvShows).length > 0
}
