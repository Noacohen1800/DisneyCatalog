import type { Character } from '../types/character'

export const API_URL = 'https://api.disneyapi.dev/character'
export const PAGE_SIZE = 50

// Builds the URL for one page of characters, optionally filtered by name.
// We build every page's URL ourselves: the API's own "nextPage" link drops the name,
// so following it during a search would load the normal catalog instead.
export function buildCharactersUrl(page: number, searchText = ''): string {
  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })

  // Extra spaces change the API's results ("Elsa " finds fewer than "Elsa"), so trim them
  const name = searchText.trim()
  if (name !== '') {
    params.set('name', name)
  }

  return `${API_URL}?${params.toString()}`
}

// The API answers with a list of characters, except when exactly one character
// matches: then "data" is that single character. This always gives back a list.
export function toCharacterList(data: Character | Character[]): Character[] {
  return Array.isArray(data) ? data : [data]
}
