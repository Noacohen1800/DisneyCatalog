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
- Add the `/characters/:id` route. It shows the catalog with a reusable **CharacterModal** (details pop-up) component on top of it. The catalog page reads the id with useParams and passes the matching character to the pop-up as a prop.
- Write a helper function, in its own file, that takes a character and returns only the categories that have data (films, TV shows, video games, allies, enemies, park attractions). The pop-up uses it to hide empty categories.
- The X button is a Link back to `/characters`. On a phone, the pop-up fills most of the screen and scrolls if the content is long.

**Done when:** clicking a card opens the pop-up over the catalog, the URL changes to `/characters/<id>`, empty categories are hidden, X closes it, pasting a `/characters/<id>` URL into a new tab opens the right pop-up, and the pop-up is readable at phone width.

## Task 3 · Load real characters from the API
- **First, check the real API before writing any code:** open the list, page 2, a search, and a single character in the browser, and compare the actual response (field names, the `info` section, how pages work) with the PRD. Update the types and the PRD if anything is different.
- Replace the sample JSON with data from the Disney API, using fetch inside useEffect. Ask for 50 characters per page.
- Write types for the API response (the list of characters and the `info` section), based on what the real API returned.
- Show three states: a loading message, an error message if the request fails, and the grid on success.
- Add the "Load more" button, which adds the next page below the current list. Don't assume a page always has exactly 50 characters: show however many come back, and decide whether to show "Load more" from the `info` section (for example `nextPage`), not from counting cards. Make sure the same character isn't added twice.
- The pop-up loads its character from the API by the id from useParams, with its own loading and error states, so a pasted link works even for characters that haven't been loaded yet.

**Done when:** the real API response was checked and the types match it, the catalog shows the first page of real characters, "Load more" adds the next page without removing the first ones and disappears on the last page, turning off the internet shows the error message, and a pasted `/characters/<id>` link for any character opens the right pop-up.

## Task 4 · Set up tests
- Install Vitest, React Testing Library, and `@vitest/ui`. Add the `test` and `test:ui` scripts.
- Write the first 3 tests:
  1. The categories helper returns only the categories that have items.
  2. The categories helper doesn't crash when a field is missing from the character.
  3. CharacterCard shows the placeholder image when the character has no image.

**Done when:** `npm test` runs and the 3 tests pass, and `npm run test:ui` opens the Vitest UI in the browser.

## Task 5 · Search by name
- Add a reusable **SearchBar** component above the grid. It gets the current text and a change handler as props.
- Typing a name loads the matching characters from the API.
- Write a helper function that turns any API answer into a list: the API returns a list, or a single character when there is exactly one match.
- Search has its own three states: a loading message while results are on the way, an error message if the search request fails, and the results (or a "No characters found" message when there are no matches). Clearing the search shows the normal list again.
- Add 2 tests: the helper returns a list unchanged, and it wraps a single character in a list.

**Done when:** searching "Mickey" shows only matching characters, a search with exactly one match still shows one card, a nonsense search shows the "no results" message, a search with the internet off shows the error message, a loading message appears while searching, clearing the box brings the full list back, and all tests pass (5 so far).

## Task 6 · Favorites page and navigation
- Write favorites helper functions, in their own file, that add a character, remove a character, and read and save the list in localStorage (id, name, image).
- Add a reusable **FavoriteButton** (heart) component to every card and to the pop-up. It gets "is this a favorite" and a click handler as props.
- Add a reusable **NavBar** component with NavLink links to Catalog, Favorites, and Random, and highlight the current page. On a phone, the links still fit on one line or wrap neatly.
- Build the `/favorites` page using the same CharacterGrid, with a friendly message and a Link to the catalog when there are no favorites.
- Add 3 tests: adding a character, removing a character, and adding the same character twice still keeps only one copy.

**Done when:** a filled heart stays filled after a refresh, the character appears on `/favorites`, clicking the heart there removes it, the empty message shows when nothing is saved, the navigation bar works at phone width, and all tests pass (8 so far).

## Task 7 · Random character page
- Build the `/random` page. It reads the total number of characters from the API and loads the character at a random position, using fetch inside useEffect, with loading and error states.
- Show the image, name, and FavoriteButton, reusing CharacterCard where possible.
- Add a "Show another" button that loads a new random character, and a "View details" Link to `/characters/<id>` that opens that character's pop-up.
- "Show another" must never show the same character twice in a row: the new random position must be different from the current one.
- Write a helper that picks a random position between 1 and the total, different from the current position. Add 2 tests: its answer always stays inside the range, and it never returns the current position.

**Done when:** `/random` shows a character, clicking "Show another" many times never shows the same character twice in a row, "View details" opens that character's pop-up at `/characters/<id>`, the heart works the same as on the catalog, the page looks fine at phone width, and all tests pass (10 so far).

## Task 8 · Final check and README
- Check every page and the pop-up at phone width (about 375px) and fix any layout problems.
- Go through the course requirements one by one:
  - React + Vite + TypeScript, React Router, Vitest, custom CSS, and no backend
  - No `any` anywhere, and types for all API data and props
  - At least 4 reusable components, each in its own file: CharacterCard, CharacterGrid, CharacterModal, SearchBar, FavoriteButton, NavBar
  - map with unique keys, data passed through props, useParams for the id, Link/NavLink for navigation
  - fetch inside useEffect, with loading, error, and success states everywhere data is loaded
  - All pages: `/characters`, `/favorites`, `/random`, and the `/characters/:id` pop-up
- Rewrite `README.md`: what the app does, how to install and run it, how to run the tests (`npm test`, `npm run test:ui`), and which API it uses (with the URL).

**Done when:** all PRD acceptance criteria pass by hand, `npm test` shows at least 5 passing tests (10 planned), `npm run test:ui` works, `npm run build` has no errors, every item on the checklist above is true, and the README covers all four topics.
