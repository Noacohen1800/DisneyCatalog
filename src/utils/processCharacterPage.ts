import type { Character, CharacterListResponse } from '../types/character'
import { hasFilmsOrTvShows } from './hasFilmsOrTvShows'

export interface ProcessedPage {
  // The characters from this page that the catalog should show
  characters: Character[]
  // True when the API says there is another page ("Load more" is shown)
  hasNextPage: boolean
  // True when every character on this page was filtered out but more pages exist,
  // so the catalog should load the next page right away
  shouldLoadNextPage: boolean
}

// Decides what the catalog does with one page of API results.
export function processCharacterPage(response: CharacterListResponse): ProcessedPage {
  const characters = response.data.filter(hasFilmsOrTvShows)
  const hasNextPage = response.info.nextPage !== null

  return {
    characters,
    hasNextPage,
    shouldLoadNextPage: characters.length === 0 && hasNextPage,
  }
}
