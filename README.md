# ✦ Disney Catalog

*Where every character has a little magic.*

Disney Catalog is a small React web app for Disney fans of all ages. You can browse thousands of Disney characters, search for your favorites by name, see the films and TV shows each one appears in, save the characters you love, and meet a surprise character on the "Mystery Reveal" page.

It is a front-end only app (no backend, no database). Character data comes from the free [Disney API](https://disneyapi.dev), and favorites are saved in your browser.

## What you can do

- **Browse the catalog** (`/characters`): a grid of character cards, 4 per row on desktop and fewer on smaller screens. Only characters that appear in at least one film or TV show are listed. "Load more" adds the next page.
- **Search by name**: type in the search box and matching characters load from the API, with loading, "no results", and error messages. Clear the box to see the full catalog again.
- **Open a character's details**: click a card and it grows downward in place to show its **Films** and **TV Shows** (empty categories are hidden). Each open card has its own URL (`/characters/<id>`), so you can share or reload it. ✕ closes it. An unknown id shows a "Character not found" page.
- **Save favorites** (`/favorites`): tap the ♡ in the corner of any card. Favorites stay after a refresh (they are stored in `localStorage`), and cards open in place on the Favorites page too (`/favorites/<id>`).
- **Mystery Reveal** (`/random`): press **Reveal Character** to play a short magical animation, then meet a random character. Open its details right on the page, add it to your favorites, or press **Try Again** for someone new (never the same character twice in a row).
- Works on desktop, tablets, and phones, and respects the "reduce motion" setting.

## How to run it

You need [Node.js](https://nodejs.org) version 22.12 or newer (required by Vite and Vitest).

```bash
# 1. Install the dependencies (once)
npm install

# 2. Start the app
npm run dev
```

Then open the address shown in the terminal (usually <http://localhost:5173>).

To build and check the production version:

```bash
npm run build     # type-check and build into dist/
npm run preview   # serve the built app locally
```

## How to run the tests

The project uses [Vitest](https://vitest.dev) with React Testing Library.

```bash
npm test          # run all tests once in the terminal
npm run test:ui   # open the Vitest UI in the browser to explore the tests
```

The tests check the app's own logic: the catalog filter, hiding empty categories, pagination and duplicates, building search URLs, handling a single search result, favorites and `localStorage`, random selection, the image fallback, the navigation bar, and full user flows on the catalog, Favorites, and Random pages (using a fake API, so the tests don't need the internet).

## The API

All character data comes from the **Disney API**: free, public, and no key needed.

- Base URL: `https://api.disneyapi.dev/character`
- A page of characters: `https://api.disneyapi.dev/character?page=1&pageSize=50`
- Search by name: `https://api.disneyapi.dev/character?name=Mickey&page=1&pageSize=50`
- One character: `https://api.disneyapi.dev/character/4703`

Fields used: `_id`, `name`, `imageUrl`, `films`, and `tvShows`.

A few things the app handles because of how the API behaves:

- When exactly one character matches, `data` is a single object instead of a list.
- The `nextPage` link in search results drops the name, so the app builds every page URL itself.
- `info.count` is the number of characters on the current page, not the total. The Random page asks for `pageSize=1` and uses `info.totalPages` as the total.
- Some images are missing or broken; those cards show a friendly placeholder.

## Built with

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite](https://vite.dev)
- [React Router](https://reactrouter.com) for the pages and character URLs
- [Vitest](https://vitest.dev) and [React Testing Library](https://testing-library.com) for tests
- Custom CSS, with the fonts Great Vibes, Cormorant Garamond, and Nunito from [Google Fonts](https://fonts.google.com)

## Project structure

```
src/
  components/   reusable components (CharacterCard, CharacterGrid, CharacterDetails,
                SearchBar, FavoriteButton, NavBar, PageHeader, MysterySilhouette, RevealSparkles)
  pages/        CatalogPage, FavoritesPage, RandomPage
  hooks/        useFavorites
  utils/        helpers for the API, filtering, pagination, favorites, and random picks
  types/        TypeScript types for the API data
```

Planning documents: [PRD.md](PRD.md) (what we are building) and [tasks.md](tasks.md) (the build steps). Every prompt sent to the coding agent is logged in [PROMPTS.md](PROMPTS.md).
