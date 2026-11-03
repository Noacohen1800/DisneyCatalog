import './SearchBar.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <label htmlFor="character-search" className="search-bar__label">
        Search characters by name
      </label>
      <input
        id="character-search"
        className="search-bar__input"
        type="search"
        placeholder="Search characters by name…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
      {value !== '' && (
        <button
          type="button"
          className="search-bar__clear"
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default SearchBar
