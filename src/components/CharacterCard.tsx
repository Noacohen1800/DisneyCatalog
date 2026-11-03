import { useEffect, useRef, useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Character } from '../types/character'
import CharacterDetails from './CharacterDetails'
import FavoriteButton from './FavoriteButton'
import './CharacterCard.css'

// The Mickey silhouette shown whenever a character has no usable image
const PLACEHOLDER_IMAGE = '/placeholder.svg'

// When an image is missing, the Disney Wiki server answers "404 Not Found" but still sends
// its own small grey "not found" picture (300 x 171 pixels), so the browser shows it as a normal image.
// An <img> can't see the 404, so for images of exactly that size we ask the server for the
// real status and only switch to our placeholder if it really is a "not found" answer.
const WIKI_MISSING_IMAGE_WIDTH = 300
const WIKI_MISSING_IMAGE_HEIGHT = 171

interface CharacterCardProps {
  character: Character
  isExpanded: boolean
  isFavorite: boolean
  onToggleFavorite: () => void
  // The page the card belongs to: a closed card opens at basePath/<id>, and ✕ goes back to basePath
  basePath: string
}

function CharacterCard({
  character,
  isExpanded,
  isFavorite,
  onToggleFavorite,
  basePath,
}: CharacterCardProps) {
  const cardRef = useRef<HTMLElement>(null)

  // When a card opens (also from a direct link), scroll it into view
  useEffect(() => {
    if (isExpanded) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isExpanded])

  // True once we know the character's image can't be shown
  const [imageFailed, setImageFailed] = useState(false)

  async function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = event.currentTarget
    const looksLikeMissingImage =
      naturalWidth === WIKI_MISSING_IMAGE_WIDTH && naturalHeight === WIKI_MISSING_IMAGE_HEIGHT
    if (!looksLikeMissingImage || !character.imageUrl) return

    try {
      // HEAD asks only for the status, without downloading the picture again
      const response = await fetch(character.imageUrl, { method: 'HEAD' })
      if (!response.ok) {
        setImageFailed(true)
      }
    } catch {
      // We couldn't check. The picture did load, so keep showing it.
    }
  }

  // Use the placeholder when there is no image URL, or the image failed to load
  const showPlaceholder = !character.imageUrl || imageFailed

  const image = (
    <img
      className="character-card__image"
      src={showPlaceholder ? PLACEHOLDER_IMAGE : character.imageUrl}
      alt={character.name}
      loading="lazy"
      // The Disney Wiki image server sometimes blocks images when the browser sends a referrer
      referrerPolicy="no-referrer"
      // The link is broken or the server is unreachable
      onError={() => setImageFailed(true)}
      // The server may have sent its "not found" picture instead of the real image
      onLoad={showPlaceholder ? undefined : handleImageLoad}
    />
  )

  // The heart in the top-right corner of the image, on closed and expanded cards
  const heart = (
    <FavoriteButton
      isFavorite={isFavorite}
      onClick={onToggleFavorite}
      characterName={character.name}
    />
  )

  if (isExpanded) {
    return (
      <article ref={cardRef} className="character-card character-card--expanded">
        {image}
        {heart}
        <div className="character-card__body">
          <div className="character-card__header">
            <h2 className="character-card__name">{character.name}</h2>
            <Link to={basePath} className="character-card__close" aria-label="Close details">
              ✕
            </Link>
          </div>
          <CharacterDetails character={character} />
        </div>
      </article>
    )
  }

  return (
    <article className="character-card">
      {/* The image and name are a link that opens this character's details */}
      <Link to={`${basePath}/${character._id}`} className="character-card__link">
        {image}
        <h2 className="character-card__name">{character.name}</h2>
      </Link>
      {/* The heart sits outside the link, so clicking it doesn't open the card */}
      {heart}
    </article>
  )
}

export default CharacterCard
