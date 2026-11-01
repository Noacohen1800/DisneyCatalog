import type { Character } from '../types/character'
import './CharacterCard.css'

const PLACEHOLDER_IMAGE = '/placeholder.svg'

interface CharacterCardProps {
  character: Character
}

function CharacterCard({ character }: CharacterCardProps) {
  // Use the placeholder when the character has no image at all
  const imageSrc = character.imageUrl || PLACEHOLDER_IMAGE

  return (
    <article className="character-card">
      <img
        className="character-card__image"
        src={imageSrc}
        alt={character.name}
        loading="lazy"
        // The Disney Wiki image server sometimes blocks images when the browser sends a referrer
        referrerPolicy="no-referrer"
        // Also use the placeholder if the image link is broken
        onError={(event) => {
          event.currentTarget.src = PLACEHOLDER_IMAGE
        }}
      />
      <h2 className="character-card__name">{character.name}</h2>
    </article>
  )
}

export default CharacterCard
