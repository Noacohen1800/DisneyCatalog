import './FavoriteButton.css'

interface FavoriteButtonProps {
  isFavorite: boolean
  onClick: () => void
  // Used in the button's label for screen readers, e.g. "Add Elsa to favorites"
  characterName: string
}

function FavoriteButton({ isFavorite, onClick, characterName }: FavoriteButtonProps) {
  const label = isFavorite
    ? `Remove ${characterName} from favorites`
    : `Add ${characterName} to favorites`

  return (
    <button
      type="button"
      className={isFavorite ? 'favorite-button favorite-button--active' : 'favorite-button'}
      onClick={onClick}
      aria-label={label}
      aria-pressed={isFavorite}
      title={label}
    >
      {/* A heart: only the outline when not a favorite, filled when it is */}
      <svg className="favorite-button__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 2.9 5 6.4 5c2.1 0 3.6 1.2 4.4 2.5h2.4C14 6.2 15.5 5 17.6 5 21.1 5 23 8.6 21.6 11.8 19.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  )
}

export default FavoriteButton
