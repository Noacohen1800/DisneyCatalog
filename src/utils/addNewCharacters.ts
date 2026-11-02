import type { Character } from '../types/character'

// Adds the new characters to the end of the current list,
// skipping characters that are already in the list (same _id).
export function addNewCharacters(current: Character[], incoming: Character[]): Character[] {
  const existingIds = new Set(current.map((character) => character._id))
  const newOnes = incoming.filter((character) => !existingIds.has(character._id))
  return [...current, ...newOnes]
}
