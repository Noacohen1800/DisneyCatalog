import { describe, expect, it } from 'vitest'
import type { ApiInfo, Character, CharacterListResponse } from '../types/character'
import { addNewCharacters } from './addNewCharacters'
import { processCharacterPage } from './processCharacterPage'

function makeCharacter(id: number, films: string[] = ['Some Film']): Character {
  return { _id: id, name: `Character ${id}`, films, tvShows: [] }
}

function makePage(data: Character[], nextPage: string | null): CharacterListResponse {
  const info: ApiInfo = { count: data.length, totalPages: 197, previousPage: null, nextPage }
  return { info, data }
}

describe('addNewCharacters ("Load more" adds a page to the list)', () => {
  it('adds the new page after the current characters, keeping the order', () => {
    const current = [makeCharacter(1), makeCharacter(2)]
    const result = addNewCharacters(current, [makeCharacter(3), makeCharacter(4)])

    expect(result.map((character) => character._id)).toEqual([1, 2, 3, 4])
  })

  it('skips characters that are already shown, so the same page loaded twice adds nothing', () => {
    const current = [makeCharacter(1), makeCharacter(2)]

    expect(addNewCharacters(current, [makeCharacter(2), makeCharacter(3)]).map((c) => c._id)).toEqual([1, 2, 3])
    expect(addNewCharacters(current, current).map((c) => c._id)).toEqual([1, 2])
  })

  it("doesn't change the original list (React state must not be changed directly)", () => {
    const current = [makeCharacter(1)]
    addNewCharacters(current, [makeCharacter(2)])

    expect(current.map((character) => character._id)).toEqual([1])
  })
})

describe('processCharacterPage (what the catalog does with one API page)', () => {
  it('keeps only characters with films or TV shows and shows "Load more" while there is a next page', () => {
    const page = makePage(
      [makeCharacter(1), makeCharacter(2, []), makeCharacter(3)],
      'http://api.disneyapi.dev/character?page=2&pageSize=50',
    )

    const result = processCharacterPage(page)

    expect(result.characters.map((character) => character._id)).toEqual([1, 3])
    expect(result.hasNextPage).toBe(true)
    expect(result.shouldLoadNextPage).toBe(false)
  })

  it('hides "Load more" on the last page, even if it has fewer than 50 characters', () => {
    const lastPage = makePage([makeCharacter(1)], null)

    const result = processCharacterPage(lastPage)

    expect(result.characters).toHaveLength(1)
    expect(result.hasNextPage).toBe(false)
  })

  it('loads the next page automatically when every character on a page is filtered out', () => {
    const allFiltered = makePage([makeCharacter(1, []), makeCharacter(2, [])], 'next-page-url')

    const result = processCharacterPage(allFiltered)

    expect(result.characters).toEqual([])
    expect(result.shouldLoadNextPage).toBe(true)
  })

  it('handles a search with exactly one match, where the API sends a single object', () => {
    const oneMatch: CharacterListResponse = {
      info: { count: 1, totalPages: 1, previousPage: null, nextPage: null },
      data: makeCharacter(7),
    }
    const oneMatchFilteredOut: CharacterListResponse = {
      info: { count: 1, totalPages: 1, previousPage: null, nextPage: null },
      data: makeCharacter(8, []),
    }

    expect(processCharacterPage(oneMatch).characters.map((character) => character._id)).toEqual([7])
    // The single match has no films or TV shows: no results, and nothing more to load
    expect(processCharacterPage(oneMatchFilteredOut)).toEqual({
      characters: [],
      hasNextPage: false,
      shouldLoadNextPage: false,
    })
  })

  it('stops on an empty last page instead of trying to load pages that don\'t exist', () => {
    const emptyLastPage = makePage([], null)

    const result = processCharacterPage(emptyLastPage)

    expect(result.shouldLoadNextPage).toBe(false)
    expect(result.hasNextPage).toBe(false)
  })
})
