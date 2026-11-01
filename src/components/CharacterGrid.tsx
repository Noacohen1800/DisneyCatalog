import type { Character } from '../types/character'
import CharacterCard from './CharacterCard'
import './CharacterGrid.css'

interface CharacterGridProps {
  characters: Character[]
}

function CharacterGrid({ characters }: CharacterGridProps) {
  return (
    <div className="character-grid">
      {characters.map((character) => (
        <CharacterCard key={character._id} character={character} />
      ))}
    </div>
  )
}

export default CharacterGrid
