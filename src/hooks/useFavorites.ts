import { useEffect, useState } from 'react'
import type { Character } from '../types/character'
import type { FavoriteCharacter } from '../utils/favorites'
import { isFavorite, loadFavorites, saveFavorites, toggleFavorite } from '../utils/favorites'

// The favorites list for a page: starts from what is saved in localStorage,
// and saves again every time it changes, so favorites stay after a refresh.
export function useFavorites() {
  // A function here means localStorage is read only once, when the page opens
  const [favorites, setFavorites] = useState<FavoriteCharacter[]>(() => loadFavorites())

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  return {
    favorites,
    isFavorite: (id: number) => isFavorite(favorites, id),
    toggleFavorite: (character: Character | FavoriteCharacter) =>
      setFavorites((current) => toggleFavorite(current, character)),
  }
}
