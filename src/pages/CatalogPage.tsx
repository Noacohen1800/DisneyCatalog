import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CharacterGrid from '../components/CharacterGrid'
import SearchBar from '../components/SearchBar'
import type {
  Character,
  CharacterListResponse,
  LoadStatus,
  SingleCharacterResponse,
} from '../types/character'
import { addNewCharacters } from '../utils/addNewCharacters'
import { API_URL, buildCharactersUrl } from '../utils/characterApi'
import { hasFilmsOrTvShows } from '../utils/hasFilmsOrTvShows'
import { processCharacterPage } from '../utils/processCharacterPage'

// Wait this long after the last key press before searching, so we don't call the API on every letter
const SEARCH_DELAY_MS = 400

// Which list to load: the search text ('' = the normal catalog) and the page number
interface ListRequest {
  query: string
  page: number
}

function CatalogPage() {
  // On /characters/:id, "id" is the character's id from the URL. On /characters it is undefined.
  const { id } = useParams()
  const navigate = useNavigate()

  // ----- Search -----
  // What is typed in the search box right now
  const [searchText, setSearchText] = useState('')

  function handleSearchChange(text: string) {
    setSearchText(text)
    // A new search closes the open card, so it doesn't stay pinned above the results
    if (id !== undefined) {
      navigate('/characters')
    }
  }

  // ----- The catalog list (normal list or search results) -----
  const [request, setRequest] = useState<ListRequest>({ query: '', page: 1 })
  const [characters, setCharacters] = useState<Character[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [listStatus, setListStatus] = useState<LoadStatus>('loading')
  // Changing this number runs the list request again ("Try again" button)
  const [retryCount, setRetryCount] = useState(0)

  // When the user stops typing, start a new search from page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      const query = searchText.trim()
      // Same search as before (for example, only spaces were added): nothing to do
      setRequest((current) => (current.query === query ? current : { query, page: 1 }))
    }, SEARCH_DELAY_MS)

    // A new key press cancels the waiting search
    return () => clearTimeout(timer)
  }, [searchText])

  // Load one page whenever the search or the page number changes
  useEffect(() => {
    // If the request changes before the answer arrives, ignore the old answer
    let ignore = false

    async function loadPage() {
      setListStatus('loading')
      // Page 1 means a new list (first visit, new search, or cleared search): start empty
      if (request.page === 1) {
        setCharacters([])
      }

      try {
        const response = await fetch(buildCharactersUrl(request.page, request.query))
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const result: CharacterListResponse = await response.json()
        if (ignore) return

        // Keep only characters with at least one film or TV show
        const { characters: visibleCharacters, hasNextPage, shouldLoadNextPage } =
          processCharacterPage(result)

        // Add them below the current list, without duplicates
        setCharacters((current) => addNewCharacters(current, visibleCharacters))
        // Show "Load more" only if the API says there is a next page
        setHasMore(hasNextPage)

        if (shouldLoadNextPage) {
          // Every character on this page was filtered out: load the next page right away
          setRequest((current) => ({ ...current, page: current.page + 1 }))
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
  }, [request, retryCount])

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

  const isSearching = request.query !== ''
  const noResults = isSearching && listStatus === 'success' && characters.length === 0

  return (
    <main className="app">
      <h1 className="app__title">Disney Catalog</h1>

      <SearchBar value={searchText} onChange={handleSearchChange} />

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

      {listStatus === 'loading' && (
        <p className="status-message">
          {isSearching && request.page === 1
            ? `Searching for "${request.query}"…`
            : 'Loading characters…'}
        </p>
      )}

      {noResults && (
        <p className="status-message">No characters found for "{request.query}".</p>
      )}

      {listStatus === 'error' && (
        <div className="status-message status-message--error">
          <p>
            {isSearching
              ? `Couldn't search for "${request.query}". Check your internet connection.`
              : "Couldn't load characters. Check your internet connection."}
          </p>
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
          <button
            type="button"
            className="button"
            onClick={() => setRequest((current) => ({ ...current, page: current.page + 1 }))}
          >
            Load more
          </button>
        </div>
      )}
    </main>
  )
}

export default CatalogPage
