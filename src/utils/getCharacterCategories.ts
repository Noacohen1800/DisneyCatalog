import type { Character } from '../types/character'

// One section in the character details, for example "Films" and its list of films
export interface CharacterCategory {
  title: string
  items: string[]
}

// Returns the Films and TV Shows categories, but only the ones that have at least one item.
// Missing fields and empty lists are skipped, so the details never show an empty section.
export function getCharacterCategories(character: Character): CharacterCategory[] {
  const allCategories: CharacterCategory[] = [
    { title: 'Films', items: character.films ?? [] },
    { title: 'TV Shows', items: character.tvShows ?? [] },
  ]

  return allCategories.filter((category) => category.items.length > 0)
}
