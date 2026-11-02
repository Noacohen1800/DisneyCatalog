import { Link, useParams } from 'react-router-dom'
import CharacterGrid from '../components/CharacterGrid'
import sampleCharacters from '../data/sampleCharacters.json'
import type { Character } from '../types/character'

// Sample data from a local file. Task 3 replaces this with the real API.
const characters: Character[] = sampleCharacters

function CatalogPage() {
  // On /characters/:id, "id" is the character's id from the URL. On /characters it is undefined.
  const { id } = useParams()

  const selectedCharacter = characters.find(
    (character) => String(character._id) === id,
  )

  // An id in the URL that matches no character: show only the error, without the catalog
  if (id && !selectedCharacter) {
    return (
      <main className="not-found">
        <h1 className="not-found__title">Character not found</h1>
        <p>We couldn't find a character with the id "{id}".</p>
        <Link to="/characters" className="not-found__link">
          Back to the catalog
        </Link>
      </main>
    )
  }

  return (
    <main className="app">
      <h1 className="app__title">Disney Catalog</h1>
      <CharacterGrid characters={characters} expandedId={selectedCharacter?._id} />
    </main>
  )
}

export default CatalogPage
