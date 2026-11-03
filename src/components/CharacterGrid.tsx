import type { Character } from '../types/character'
import CharacterCard from './CharacterCard'
import './CharacterGrid.css'

interface CharacterGridProps {
  characters: Character[]
  // The id of the card that is open, or undefined when all cards are closed
  expandedId?: number
  isFavorite: (id: number) => boolean
  onToggleFavorite: (character: Character) => void
  // Where the cards open and close: '/characters' in the catalog, '/favorites' on the Favorites page
  basePath?: string
}

function CharacterGrid({
  characters,
  expandedId,
  isFavorite,
  onToggleFavorite,
  basePath = '/characters',
}: CharacterGridProps) {
  return (
    <div className="character-grid">
      {characters.map((character) => (
        <CharacterCard
          key={character._id}
          character={character}
          isExpanded={character._id === expandedId}
          isFavorite={isFavorite(character._id)}
          onToggleFavorite={() => onToggleFavorite(character)}
          basePath={basePath}
        />
      ))}
    </div>
  )
}

export default CharacterGrid
