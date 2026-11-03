// One Disney character, as the Disney API returns it.
// The API doesn't always send every field, so all the lists and the image are optional.
export interface Character {
  _id: number
  name: string
  imageUrl?: string
  url?: string
  films?: string[]
  shortFilms?: string[]
  tvShows?: string[]
  videoGames?: string[]
  parkAttractions?: string[]
  allies?: string[]
  enemies?: string[]
}

// The "info" part of every API answer
export interface ApiInfo {
  count: number // characters in THIS answer, not the total
  totalPages: number
  previousPage: string | null
  nextPage: string | null // null on the last page
}

// Answer for a page of characters: /character?page=1&pageSize=50 (and &name=... when searching)
// Usually "data" is a list, but when a search matches exactly one character it is that single character.
export interface CharacterListResponse {
  info: ApiInfo
  data: Character | Character[]
}

// Answer for one character: /character/{id}
// "data" is the character, or an empty list when no character has that id.
export interface SingleCharacterResponse {
  info: ApiInfo
  data: Character | Character[]
}

export type LoadStatus = 'loading' | 'error' | 'success'
