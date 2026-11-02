import type { Character } from '../types/character'
import { getCharacterCategories } from '../utils/getCharacterCategories'
import './CharacterDetails.css'

interface CharacterDetailsProps {
  character: Character
}

// The lists shown inside an expanded card (Films and TV Shows)
function CharacterDetails({ character }: CharacterDetailsProps) {
  const categories = getCharacterCategories(character)

  if (categories.length === 0) {
    return <p className="character-details__empty">No films or TV shows are listed for this character.</p>
  }

  return (
    <div className="character-details">
      {categories.map((category) => (
        <section key={category.title} className="character-details__section">
          <h3 className="character-details__title">{category.title}</h3>
          <ul className="character-details__list">
            {/* The API sometimes lists the same name twice, so the index keeps every key unique */}
            {category.items.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default CharacterDetails
