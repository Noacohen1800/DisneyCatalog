import type { Character } from '../types/character'
import CharacterCard from './CharacterCard'
import './CharacterGrid.css'

interface CharacterGridProps {
  characters: Character[]
  // The id of the card that is open, or undefined when all cards are closed
  expandedId?: number
}

function CharacterGrid({ characters, expandedId }: CharacterGridProps) {
  return (
    <div className="character-grid">
      {characters.map((character) => (
        <CharacterCard
          key={character._id}
          character={character}
          isExpanded={character._id === expandedId}
        />
      ))}
    </div>
  )
}

export default CharacterGrid
