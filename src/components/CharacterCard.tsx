import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Character } from '../types/character'
import CharacterDetails from './CharacterDetails'
import './CharacterCard.css'

const PLACEHOLDER_IMAGE = '/placeholder.svg'

interface CharacterCardProps {
  character: Character
  isExpanded: boolean
}

function CharacterCard({ character, isExpanded }: CharacterCardProps) {
  const cardRef = useRef<HTMLElement>(null)

  // When a card opens (also from a direct link), scroll it into view
  useEffect(() => {
    if (isExpanded) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isExpanded])

  const image = (
    <img
      className="character-card__image"
      // Use the placeholder when the character has no image at all
      src={character.imageUrl || PLACEHOLDER_IMAGE}
      alt={character.name}
      loading="lazy"
      // The Disney Wiki image server sometimes blocks images when the browser sends a referrer
      referrerPolicy="no-referrer"
      // Also use the placeholder if the image link is broken
      onError={(event) => {
        event.currentTarget.src = PLACEHOLDER_IMAGE
      }}
    />
  )

  if (isExpanded) {
    return (
      <article ref={cardRef} className="character-card character-card--expanded">
        {image}
        <div className="character-card__body">
          <div className="character-card__header">
            <h2 className="character-card__name">{character.name}</h2>
            <Link to="/characters" className="character-card__close" aria-label="Close details">
              ✕
            </Link>
          </div>
          <CharacterDetails character={character} />
        </div>
      </article>
    )
  }

  return (
    // A closed card is a link that opens this character's details
    <Link to={`/characters/${character._id}`} className="character-card">
      {image}
      <h2 className="character-card__name">{character.name}</h2>
    </Link>
  )
}

export default CharacterCard
