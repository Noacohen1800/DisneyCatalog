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
- Write favorites helper functions, in their own file (`utils/favorites.ts`), that add, remove, and toggle a character, and read and save the list in localStorage (id, name, image, films, TV shows, so the Favorites page can show expanded cards without the API). Reading ignores broken or hand-edited data, and a blocked localStorage doesn't crash the app.
- Add a `useFavorites` hook that starts from the saved list and saves again on every change. Each page that shows hearts uses it and passes `isFavorite` and `onToggleFavorite` down through CharacterGrid to each card as props.
- Add a reusable **FavoriteButton** (heart) component in the top-right corner of every card's image, closed and expanded: a small heart in a subtle round background that fills pink-red for a favorite. It gets "is this a favorite", a click handler, and the character's name (for its screen-reader label) as props. The closed card is now an `article` with the link and the heart side by side, so clicking the heart doesn't open the card.
- Add a reusable **NavBar** component, shown on every page, with NavLink links to Catalog, Favorites, and Random, and highlight the current page (Catalog also stays highlighted while a card is open). On a phone, the links still fit on one line or wrap neatly.
- Build the `/favorites` page using the same CharacterGrid, without calling the API, with a friendly message and a Link to the catalog when there are no favorites. Clicking a card expands it on the Favorites page itself, the same way as in the catalog, at `/favorites/:id` (read with useParams). CharacterGrid and CharacterCard get a `basePath` prop (`/characters` or `/favorites`) so cards open and close on the page they belong to. Removing the expanded favorite closes it, and a `/favorites/:id` link to a character that isn't a favorite goes to `/favorites`.
- Add tests: the favorites helpers (add keeps only id/name/image/films/TV shows, no duplicates, remove, toggle, no direct state changes, save and load, broken data, blocked storage), the NavBar links and highlighting, and the whole flow with a fake API (heart fills and stays after a "refresh", clicking the heart doesn't open the card, the Favorites page lists and removes cards, and the empty message), plus expanding on the Favorites page (opens at `/favorites/<id>` without the API, ✕ closes it, removing from an expanded card, and a link to a non-favorite).

**Done when:** a filled heart stays filled after a refresh, the character appears on `/favorites`, clicking the heart there removes it, clicking a card there expands it on the Favorites page (and ✕ closes it), the empty message shows when nothing is saved, the navigation bar works at phone width, and all tests pass.

## Task 7 · Random character page ("Mystery Reveal")
- Build the `/random` page. It starts with a reusable **MysterySilhouette** component (a dark mouse-ears silhouette with a glowing question mark) and a "Reveal Character" button. Nothing is loaded until the button is clicked.
- Clicking it plays a short reveal animation (shake, growing golden glow, twinkling sparkles drawn with map) for at least 1.6 seconds while the character loads, then the character pops in. The animation is turned off for people who choose reduced motion in their system settings.
- Loading: reads the total number of characters once (`info.totalPages` when asking with `pageSize=1`, since `info.count` is only the current page), then loads the character at a random position, using fetch inside useEffect. The animation is the loading state; a failed request shows an error with a "Try Again" button.
- Skip characters without films or TV shows (the catalog doesn't show them, and their expanded card would be empty) and try another position, up to 8 times before showing the error.
- Show the revealed character with the same CharacterCard (image, name, FavoriteButton) used in the catalog. It floats in out of a soft blur, with a reusable **RevealSparkles** component over its picture: a soft golden glow and a burst of little sparkles that play once for each new character.
- Clicking the revealed card expands it right on `/random`, with the same expandable card and details as the catalog. CharacterCard gets two optional props, `onOpen` and `onClose`: when given, the card opens and closes through them (a keyboard-usable button and a ✕ button) instead of links, so the URL doesn't change. The catalog and Favorites pages don't pass them and keep using links.
- Add a "Try Again" button that reveals another character (its card starts closed), and a "View Details" button that expands the card in place. While the card is open, its ✕ closes it and "View Details" is hidden.
- "Try Again" must never show the same character twice in a row: use the `pickRandomPosition` helper (written and tested in Task 4) to pick a position different from the current one.
- Add tests with a fake API and no animation delay: the starting mystery state makes no requests; the reveal shows the animation, then a character with its sparkles and View Details button; the total is read once and positions stay in range; "Try Again" never repeats the same character twice in a row; characters without films or TV shows are skipped; the heart adds and removes the favorite; an API error shows the error and "Try Again" recovers; it gives up after 8 unusable characters. Expanding on the Random page: clicking the card (or pressing Enter) opens its details without leaving `/random` or calling the API; "View Details" opens it and ✕ closes it; the heart works while it is open; "Try Again" shows the next character closed with a new sparkle burst. CharacterCard: links by default, `onOpen` and `onClose` when given.

**Done when:** `/random` shows the mystery silhouette, "Reveal Character" plays the animation and shows a character, clicking "Try Again" many times never shows the same character twice in a row, the revealed character appears with a golden glow and sparkles, clicking it or "View Details" expands its details on `/random` and ✕ closes them, the heart works the same as on the catalog, the page looks fine at phone width, and all tests pass.

## Task 8 · Visual design, final check, and README
- Redesign the whole site with a bright, magical look (see "Look and feel" in the PRD), keeping every feature working exactly as before:
  - Design tokens in `index.css`: cream, white, and pastel backgrounds, warm gold accents (no dominant purple), very dark text, soft shadows, and a light-only color scheme.
  - Fonts from Google Fonts (no extra libraries): Great Vibes for the fairytale title, Cormorant Garamond for headings, Nunito for body text.
  - A reusable **PageHeader** component on every page: the decorated title with twinkling stars and a golden divider. The catalog uses the big "hero" version with the tagline "Where every character has a little magic."
  - NavBar: frosted cream bar with the site name in the fairytale font, pill links with small icons, and a golden pill for the current page.
  - Cards: white with a pastel picture frame, rounded corners, soft shadows, a golden hover glow, and a small star on hover. Heart, search box, buttons, empty state, error messages, and the "Character not found" page restyled to match.
  - Mystery Reveal and sparkles kept, recolored: a midnight-blue silhouette with golden light, a rose-to-gold Reveal button, and the "No image" placeholder in cream and gold.
  - Remove the unused Vite template images.
- Check every page and the expanded card at phone width (about 375px and 320px) and fix any layout problems.
- Go through the course requirements one by one:
  - React + Vite + TypeScript, React Router, Vitest, custom CSS, and no backend
  - No `any` anywhere, and types for all API data and props
  - At least 4 reusable components, each in its own file: CharacterCard, CharacterGrid, CharacterDetails, SearchBar, FavoriteButton, NavBar, PageHeader, MysterySilhouette, RevealSparkles
  - map with unique keys, data passed through props, useParams for the id, Link/NavLink for navigation
  - fetch inside useEffect, with loading, error, and success states everywhere data is loaded
  - All pages: `/characters`, `/favorites`, `/random`, the `/characters/:id` expanded card, and the full-page "Character not found" error
- Rewrite `README.md`: what the app does, how to install and run it, how to run the tests (`npm test`, `npm run test:ui`), and which API it uses (with the URL).

**Done when:** the new design looks bright and consistent on every page at desktop and phone width, every feature still works, all PRD acceptance criteria pass by hand, `npm test` shows at least 5 passing tests (79 after Task 8), `npm run test:ui` works, `npm run build` has no errors, every item on the checklist above is true, and the README covers all four topics.
