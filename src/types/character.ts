// One Disney character, as the Disney API returns it.
// The API doesn't always send every field, so all the lists and the image are optional.
export interface Character {
  _id: number
  name: string
  imageUrl?: string
  films?: string[]
  shortFilms?: string[]
  tvShows?: string[]
  videoGames?: string[]
  parkAttractions?: string[]
  allies?: string[]
  enemies?: string[]
}
