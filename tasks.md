# Tasks: Disney Catalog

Build in this order, one task at a time, with one commit per task (including `PROMPTS.md`).

**About `PROMPTS.md`:** the hooks update it automatically with every prompt. The agent never edits it or adds prompts to it. After each completed task, the agent reminds me to add my own short note (what I checked and what I changed myself), and I add that note myself before the commit.

**Before Task 1:** create the Vite app (React + TypeScript) in this folder, following steps 4–5 of the starter README, and make the first commit.

## Rules for every task
- **TypeScript:** every piece of API data and every component's props has a `type` or `interface`. Never use `any`.
- **Components:** each reusable component lives in its own file in a components folder. Pages live separately in a pages folder and don't count as reusable components.
- **Data flow:** components get their data through props. Lists are drawn with map, and every item has a unique key (the character's `_id`).
- **Navigation:** moving between screens uses React Router's Link or NavLink, never plain `<a>` links or full page reloads.
- **Mobile:** check every new screen at phone width before calling the task done.
- **Tests:** tests check our own logic (helper functions and our components), not the API or React itself.

---

## Task 1 · Show the list from sample data
- Create a small local JSON file with about 6 sample characters copied from the Disney API. Include at least one character with no image and some empty lists, so missing data can be tested from the start.
- Write a TypeScript type for a character that matches the API fields in the PRD. Missing or empty fields must be allowed.
- Build a reusable **CharacterCard** component (image, name, placeholder when there is no image) and a reusable **CharacterGrid** component that gets the characters as a prop and shows the cards using map with a unique key. Each component gets its own props type.
- Add basic custom CSS: a grid that turns into one or two columns on narrow screens.

**Done when:** `npm run dev` shows the 6 sample cards with images and names, the character with no image shows a placeholder, the grid looks fine at phone width, and neither component uses `any`.

## Task 2 · Click a card to see its details
- Install React Router. Add the `/characters` route for the catalog page, and send `/` to `/characters`.
- Make each card a Link to `/characters/<id>`.
- Add the `/characters/:id` route. It shows the same catalog page, which reads the id with useParams and tells CharacterGrid which card is expanded. That card opens in its own column and grows downward (image on top, details below), pushing the rows below it down without moving any other card sideways, while the rest of the catalog stays visible, and it scrolls into view.
- Add a reusable **CharacterDetails** component that gets the character as a prop and shows the Films and TV Shows lists inside the expanded card.
- Write a helper function, in its own file, that takes a character and returns the Films and TV Shows categories, keeping only the ones that have data. CharacterDetails uses it to hide empty categories.
- The ✕ button on the expanded card is a Link back to `/characters`, which collapses it. Long lists scroll inside the card. On very narrow screens, the expanded card stacks the image above the details.
- If the id in the URL matches no character, show a full-page "Character not found" message with a Link back to the catalog, without the catalog behind it.

**Done when:** clicking a card expands it in place with only Films and TV Shows (empty ones hidden), the URL changes to `/characters/<id>`, ✕ collapses it and returns to `/characters`, pasting a `/characters/<id>` URL into a new tab opens the right card, an unknown id shows the full-page error, and the expanded card looks fine at phone width.

## Task 3 · Load real characters from the API
- **First, check the real API before writing any code:** open the list, page 2, a search, and a single character in the browser, and compare the actual response (field names, the `info` section, how pages work) with the PRD. Update the types and the PRD if anything is different.
- Replace the sample JSON with data from the Disney API, using fetch inside useEffect. Ask for 50 characters per page.
- Keep only characters with at least one non-blank item in `films` or `tvShows` (a helper in its own file), on the first page and on every page loaded later. If a whole page is filtered out, load the next one automatically.
- Show the Mickey silhouette placeholder when a character has no image, when the image fails to load, or when the image server sends its 300×171 "not found" picture (confirmed with a HEAD request, so a real image of that size is kept).
- Write types for the API response (the list of characters and the `info` section), based on what the real API returned.
- Show three states: a loading message, an error message if the request fails, and the grid on success.
- Add the "Load more" button, which adds the next page below the current list. Don't assume a page always has exactly 50 characters: show however many come back, and decide whether to show "Load more" from the `info` section (for example `nextPage`), not from counting cards. Make sure the same character isn't added twice.
- For `/characters/:id`, if the character isn't in the loaded list, load it from the API by the id from useParams (with its own loading and error states) and show it expanded at the top of the grid, so a pasted link works even for characters that haven't been loaded yet. If the API has no character with that id, show the full-page "Character not found" message.

**Done when:** the real API response was checked and the types match it, the catalog shows the first page of real characters and every card has at least one film or TV show, missing or broken images show the Mickey placeholder, "Load more" adds the next page without removing the first ones and disappears on the last page, turning off the internet shows the error message, a pasted `/characters/<id>` link for any character opens that character's expanded card, and a non-existent id shows the full-page error.

## Task 4 · Set up tests
- Install Vitest, React Testing Library, jsdom, and `@vitest/ui`. Add the `test` (`vitest run`) and `test:ui` (`vitest --ui`) scripts, and set the test environment to jsdom in `vite.config.ts`.
- Move the per-page logic of the catalog (filter, "is there a next page", "skip a page that was fully filtered out") into a `processCharacterPage` helper, so it can be tested.
- Add the `pickRandomPosition` helper now (a pure function, not the Random page itself), so random selection is tested from the start. Task 7 uses it.
- Write tests for our own logic, next to the files they test:
  1. **Catalog filter** (`hasFilmsOrTvShows`): keeps films-only and TV-only characters, removes empty, missing, blank-only, and video-games/parks-only characters.
  2. **Empty categories** (`getCharacterCategories`): returns only Films and TV Shows in order, hides empty ones, removes blank entries, and doesn't crash on missing fields.
  3. **Pagination** (`addNewCharacters`, `processCharacterPage`): keeps order, skips duplicates, doesn't change React state directly, hides "Load more" on the last page, and loads the next page when a page is fully filtered out.
  4. **Random selection** (`pickRandomPosition`): always in range, never the current position, correct at the extremes, works with one character, and rejects invalid totals.
  5. **Image fallback** (`CharacterCard`): placeholder with no URL or after a load error, and the 300×171 check replaces the image only when the server answers "not found".

**Done when:** `npm test` runs and all tests pass (24 tests in 5 files), `npm run build` still passes, and `npm run test:ui` opens the Vitest UI in the browser.

## Task 5 · Search by name
- Add a reusable **SearchBar** component above the grid. It gets the current text and a change handler as props, and has a ✕ button that clears it.
- Typing a name loads the matching characters from the API, 400 ms after the user stops typing (one request, not one per letter). Spaces at the start and end are trimmed.
- Search results use the same loading, catalog filter (films or TV shows), and "Load more" as the normal list. Every page's URL is built by the app (`buildCharactersUrl`), because the API's `nextPage` link drops the search name.
- Write a helper function (`toCharacterList`) that turns any API answer into a list: the API returns a list, or a single character when there is exactly one match.
- Search has its own three states: a loading message while results are on the way, an error message if the search request fails, and the results (or a "No characters found" message when there are no matches). Clearing the search shows the normal list again.
- Typing a new search closes an open card, so it doesn't stay pinned above the results.
- Add tests: `buildCharactersUrl` and `toCharacterList` (URL building, trimming, special characters, single object vs. list), a single-match page in `processCharacterPage`, and a test of the whole search on the catalog page with a fake API (results, filter, single match, no results, loading and error messages, one request while typing, clearing).

**Done when:** searching "Mickey" shows only matching characters, a search with exactly one match still shows one card, a nonsense search shows the "no results" message, a search with the internet off shows the error message, a loading message appears while searching, clearing the box brings the full list back, and all tests pass.

## Task 6 · Favorites page and navigation
- Write favorites helper functions, in their own file, that add a character, remove a character, and read and save the list in localStorage (id, name, image).
- Add a reusable **FavoriteButton** (heart) component to every card, closed and expanded. It gets "is this a favorite" and a click handler as props.
- Add a reusable **NavBar** component with NavLink links to Catalog, Favorites, and Random, and highlight the current page. On a phone, the links still fit on one line or wrap neatly.
- Build the `/favorites` page using the same CharacterGrid, with a friendly message and a Link to the catalog when there are no favorites.
- Add 3 tests: adding a character, removing a character, and adding the same character twice still keeps only one copy.

**Done when:** a filled heart stays filled after a refresh, the character appears on `/favorites`, clicking the heart there removes it, the empty message shows when nothing is saved, the navigation bar works at phone width, and all tests pass.

## Task 7 · Random character page
- Build the `/random` page. It reads the total number of characters from the API (`info.totalPages` when asking with `pageSize=1`, since `info.count` is only the current page) and loads the character at a random position, using fetch inside useEffect, with loading and error states.
- Show the image, name, and FavoriteButton, reusing CharacterCard where possible.
- Add a "Show another" button that loads a new random character, and a "View details" Link to `/characters/<id>` that opens that character's expanded card in the catalog.
- "Show another" must never show the same character twice in a row: the new random position must be different from the current one.
- Use the `pickRandomPosition` helper (written and tested in Task 4) to pick a position between 1 and the total that is different from the current one.

**Done when:** `/random` shows a character, clicking "Show another" many times never shows the same character twice in a row, "View details" opens that character's expanded card at `/characters/<id>`, the heart works the same as on the catalog, the page looks fine at phone width, and all tests pass.

## Task 8 · Final check and README
- Check every page and the expanded card at phone width (about 375px) and fix any layout problems.
- Go through the course requirements one by one:
  - React + Vite + TypeScript, React Router, Vitest, custom CSS, and no backend
  - No `any` anywhere, and types for all API data and props
  - At least 4 reusable components, each in its own file: CharacterCard, CharacterGrid, CharacterDetails, SearchBar, FavoriteButton, NavBar
  - map with unique keys, data passed through props, useParams for the id, Link/NavLink for navigation
  - fetch inside useEffect, with loading, error, and success states everywhere data is loaded
  - All pages: `/characters`, `/favorites`, `/random`, the `/characters/:id` expanded card, and the full-page "Character not found" error
- Rewrite `README.md`: what the app does, how to install and run it, how to run the tests (`npm test`, `npm run test:ui`), and which API it uses (with the URL).

**Done when:** all PRD acceptance criteria pass by hand, `npm test` shows at least 5 passing tests (38 after Task 5), `npm run test:ui` works, `npm run build` has no errors, every item on the checklist above is true, and the README covers all four topics.
