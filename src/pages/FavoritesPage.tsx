import { Link, Navigate, useParams } from 'react-router-dom'
import CharacterGrid from '../components/CharacterGrid'
import { useFavorites } from '../hooks/useFavorites'

function FavoritesPage() {
  // On /favorites/:id, "id" is the favorite whose card is expanded. On /favorites it is undefined.
  const { id } = useParams()
  const { favorites, isFavorite, toggleFavorite } = useFavorites()

  const expandedFavorite = favorites.find((favorite) => String(favorite._id) === id)

  // A link to a character that isn't a favorite, or the expanded favorite was just removed
  // with its heart: go back to the Favorites list
  if (id !== undefined && !expandedFavorite) {
    return <Navigate to="/favorites" replace />
  }

  return (
    <main className="app">
      <h1 className="app__title">My Favorites</h1>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__text">
            You haven't saved a favorite yet. Tap the ♡ on a character to save it here.
          </p>
          <Link to="/characters" className="button">
            Browse characters
          </Link>
        </div>
      ) : (
        // The same cards as the catalog: they open and close here, at /favorites/<id>.
        // Clicking a heart removes the character, so its card disappears right away.
        <CharacterGrid
          characters={favorites}
          expandedId={expandedFavorite?._id}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          basePath="/favorites"
        />
      )}
    </main>
  )
}

export default FavoritesPage
