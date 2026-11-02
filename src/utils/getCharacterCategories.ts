import type { Character } from '../types/character'
import { cleanList } from './hasFilmsOrTvShows'

// One section in the character details, for example "Films" and its list of films
export interface CharacterCategory {
  title: string
  items: string[]
}

// Returns the Films and TV Shows categories, but only the ones that have at least one item.
// Missing fields, empty lists, and blank entries are skipped, so the details never show an empty section.
export function getCharacterCategories(character: Character): CharacterCategory[] {
  const allCategories: CharacterCategory[] = [
    { title: 'Films', items: cleanList(character.films) },
    { title: 'TV Shows', items: cleanList(character.tvShows) },
  ]

  return allCategories.filter((category) => category.items.length > 0)
}
