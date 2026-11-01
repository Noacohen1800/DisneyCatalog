import CharacterGrid from './components/CharacterGrid'
import sampleCharacters from './data/sampleCharacters.json'
import type { Character } from './types/character'
import './App.css'

// Task 1: sample data from a local file. Task 3 replaces this with the real API.
const characters: Character[] = sampleCharacters

function App() {
  return (
    <main className="app">
      <h1 className="app__title">Disney Catalog</h1>
      <CharacterGrid characters={characters} />
    </main>
  )
}

export default App
