# PRD: Disney Catalog

## 1. One-sentence pitch
A colorful catalog where Disney fans can browse, search, and discover Disney characters, see where each one appears, and save their favorites.

## 2. Who it is for
Disney fans of all ages, both children and adults, who want to explore Disney characters and learn more about them. The site runs in the browser only, with no accounts or backend, and works on phones and narrow screens.

## 3. Screens
A navigation bar on every page links to Catalog, Favorites, and Random. Opening the site at `/` goes to the catalog.

- **Catalog — main page (`/characters`):** A grid of character cards. Only characters that appear in at least one film or TV show are listed; characters with neither are left out. Each card shows the character's image, name, and a heart button. A search box sits above the grid, and a "Load more" button sits below it.
- **Favorites (`/favorites`):** Shows only the characters the user has marked with a heart, in the same card style. Clicking a heart here removes the character from the page. If there are no favorites yet, a friendly message points the user to the catalog.
- **Random character (`/random`):** Shows one random character's image and name, a heart button, a "Show another" button that picks a new random character, and a "View details" button that opens the character's details.
- **Character details (`/characters/:id`):** Not a separate page or a pop-up. The clicked card expands in place inside the catalog: it grows to two columns wide and shows the image, the name, and the character's **Films** and **TV Shows**. A category with no data is hidden. The rest of the catalog stays visible. When the card expands, the address bar changes to that character's URL. Opening that URL directly shows the catalog with that card already expanded and scrolled into view. The ✕ button collapses the card and returns to `/characters`. If the id in the URL matches no character, a full-page "Character not found" message with a link back to the catalog is shown instead of the catalog.

## 4. Must-have features
1. **Browse:** Show the characters from the first page of 50 that have films or TV shows. "Load more" adds the next page's characters below the ones already shown.
2. **Search by name:** Typing a name shows the characters that match it.
3. **Expandable card with its own URL:** Clicking a card, or "View details" on the Random page, expands that character's card in the catalog and changes the URL. It shows Films and TV Shows, and only the ones with data.
4. **Favorites:** A heart button on every card adds or removes a character. Favorites are saved in the browser (localStorage), so they stay after a refresh, and they are listed on the Favorites page.
5. **Random character:** The Random page shows a surprise character and can pick another one with a single click.

All data screens show a loading message while data is on its way and a clear error message if the request fails.

## 5. Acceptance criteria
- When I open `/characters`, I see character cards with images, names, and hearts, every one of them with at least one film or TV show, and when I click "Load more", I see the next page's characters added below them.
- When I type "Mickey" in the search box, I see only characters whose names match "Mickey".
- When I click a character card, I see it expand in place with its Films and TV Shows (only the ones with data), the rest of the catalog is still visible, and the URL changes to `/characters/<id>`. When I click ✕, I see the card collapse and the URL return to `/characters`.
- When I paste a `/characters/<id>` link into a new tab, I see the catalog with that character's card expanded, and when the id doesn't exist, I see a full-page "Character not found" message with a link back to the catalog.
- When I click a heart and refresh the page, I see the character on the Favorites page, and when I click "Show another" on the Random page, I see a different character.

## 6. Not now (ideas for later)
- Filter characters by film or TV show
- Show more categories in the expanded card: short films, video games, allies, enemies, and park attractions
- A link to the character's Disney Wiki page
- Sort characters alphabetically
- Dark mode
- Save favorites to a user account so they sync across devices

## 7. Data
**API:** Disney API. It is free and needs no key.

- All characters, 50 per page: `https://api.disneyapi.dev/character?page=1&pageSize=50`
- Search by name: `https://api.disneyapi.dev/character?name=Mickey`
- One character (expanded card, when it isn't in the loaded list): `https://api.disneyapi.dev/character/{id}`
- Random character: ask for `?pageSize=1` and read the total from `info.totalPages` (with one character per page, the number of pages is the number of characters), then ask for `?page=<random number>&pageSize=1`. Note: `info.count` is only the number of characters on the current page, not the total.

**Fields we use:** `_id` (a number that identifies the character, used in the URL and for favorites), `name` and `imageUrl` (cards, Random page), and `films` and `tvShows` (expanded card only).

**Notes:**
- Characters don't all have the same information. Any field can be missing or empty, so only show what exists.
- **Filter:** a character is shown only if `films` or `tvShows` has at least one non-blank item. This is applied to every page that is loaded and to characters opened from a direct link (a character without films or TV shows shows "Character not found"). About 10% of characters are filtered out. If a whole page is filtered out, the next page is loaded automatically.
- **Images:** if a character has no `imageUrl`, or its image fails to load, show the Mickey silhouette placeholder. The image server answers a missing image with a 404 status but still sends a grey 300×171 "not found" picture. For images of exactly that size, the app asks the server for the real status (a HEAD request, which the server allows from other sites) and shows the placeholder only if the answer is not OK.
- When `info.nextPage` is empty, there are no more characters, so the "Load more" button is hidden.
- Asking for one character by id returns that character as a single object. An id that doesn't exist returns an empty list, not an error. A non-numeric id (like `abc`) returns the normal list, so the app treats it as "not found" without calling the API.
- When a search matches exactly one character, the API returns that single character instead of a list. The app needs to handle both cases.
- Favorites store enough information (id, name, image) to show the Favorites page without calling the API again.
