import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CharacterGrid from '../components/CharacterGrid'
import type {
  Character,
  CharacterListResponse,
  LoadStatus,
  SingleCharacterResponse,
} from '../types/character'
import { addNewCharacters } from '../utils/addNewCharacters'
import { hasFilmsOrTvShows } from '../utils/hasFilmsOrTvShows'

const API_URL = 'https://api.disneyapi.dev/character'
const PAGE_SIZE = 50

function CatalogPage() {
  // On /characters/:id, "id" is the character's id from the URL. On /characters it is undefined.
  const { id } = useParams()

  // ----- The catalog list -----
  const [characters, setCharacters] = useState<Character[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [listStatus, setListStatus] = useState<LoadStatus>('loading')
  // Changing this number runs the list request again ("Try again" button)
  const [retryCount, setRetryCount] = useState(0)

  // Load one page of characters whenever "page" changes
  useEffect(() => {
    // If the page changes before the answer arrives, ignore the old answer
    let ignore = false

    async function loadPage() {
      setListStatus('loading')
      try {
        const response = await fetch(`${API_URL}?page=${page}&pageSize=${PAGE_SIZE}`)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const result: CharacterListResponse = await response.json()
        if (ignore) return

        // Keep only characters with at least one film or TV show
        const visibleCharacters = result.data.filter(hasFilmsOrTvShows)
        const hasNextPage = result.info.nextPage !== null

        // Add them below the current list, without duplicates
        setCharacters((current) => addNewCharacters(current, visibleCharacters))
        // Show "Load more" only if the API says there is a next page
        setHasMore(hasNextPage)

        if (visibleCharacters.length === 0 && hasNextPage) {
          // Every character on this page was filtered out: load the next page right away
          setPage((current) => current + 1)
        } else {
          setListStatus('success')
        }
      } catch {
        if (!ignore) setListStatus('error')
      }
    }

    loadPage()
    return () => {
      ignore = true
    }
  }, [page, retryCount])

  // ----- The character from the URL -----
  // Character ids are numbers. Anything else (like "abc") can't be a real character.
  const isValidId = id !== undefined && /^\d+$/.test(id)
  const characterInList = characters.find((character) => String(character._id) === id)
  // Only ask the API for this character if it isn't in the list we already loaded
  const needsFetch = isValidId && !characterInList

  const [fetchedCharacter, setFetchedCharacter] = useState<Character | null>(null)
  const [characterStatus, setCharacterStatus] = useState<LoadStatus | 'not-found'>('loading')

  useEffect(() => {
    if (!needsFetch) return
    let ignore = false

    async function loadCharacter() {
      setCharacterStatus('loading')
      try {
        const response = await fetch(`${API_URL}/${id}`)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const result: SingleCharacterResponse = await response.json()
        if (ignore) return

        // A real character comes back as one object. An unknown id comes back as an empty list.
        // A character with no films and no TV shows isn't part of the catalog either.
        if (Array.isArray(result.data) || !hasFilmsOrTvShows(result.data)) {
          setCharacterStatus('not-found')
        } else {
          setFetchedCharacter(result.data)
          setCharacterStatus('success')
        }
      } catch {
        if (!ignore) setCharacterStatus('error')
      }
    }

    loadCharacter()
    return () => {
      ignore = true
    }
  }, [id, needsFetch])

  // ----- What to show -----

  const isNotFound = id !== undefined && (!isValidId || (needsFetch && characterStatus === 'not-found'))

  // An id in the URL that matches no character: show only the error, without the catalog
  if (isNotFound) {
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

  // The character to expand: from the list, or the one we loaded separately
  const loadedFromUrl =
    needsFetch && characterStatus === 'success' && String(fetchedCharacter?._id) === id
      ? fetchedCharacter
      : null
  const selectedCharacter = characterInList ?? loadedFromUrl ?? undefined

  // A character that isn't in the list yet is shown first, at the top of the grid
  const charactersToShow = loadedFromUrl ? [loadedFromUrl, ...characters] : characters

  return (
    <main className="app">
      <h1 className="app__title">Disney Catalog</h1>

      {needsFetch && characterStatus === 'loading' && (
        <p className="status-message">Loading character…</p>
      )}
      {needsFetch && characterStatus === 'error' && (
        <p className="status-message status-message--error">
          Couldn't load this character. Check your internet connection and try again.
        </p>
      )}

      {charactersToShow.length > 0 && (
        <CharacterGrid characters={charactersToShow} expandedId={selectedCharacter?._id} />
      )}

      {listStatus === 'loading' && <p className="status-message">Loading characters…</p>}

      {listStatus === 'error' && (
        <div className="status-message status-message--error">
          <p>Couldn't load characters. Check your internet connection.</p>
          <button
            type="button"
            className="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {listStatus === 'success' && hasMore && (
        <div className="load-more">
          <button type="button" className="button" onClick={() => setPage((current) => current + 1)}>
            Load more
          </button>
        </div>
      )}
    </main>
  )
}

export default CatalogPage
