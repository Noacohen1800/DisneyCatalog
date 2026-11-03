# PRD: Disney Catalog

## 1. One-sentence pitch
A colorful catalog where Disney fans can browse, search, and discover Disney characters, see where each one appears, and save their favorites.

## 2. Who it is for
Disney fans of all ages, both children and adults, who want to explore Disney characters and learn more about them. The site runs in the browser only, with no accounts or backend, and works on phones and narrow screens.

## 3. Screens
A navigation bar on every page shows the site name (it leads to the catalog) and links to Catalog, Favorites, and Random. Opening the site at `/` goes to the catalog.

**Look and feel:** bright, light, and magical. Cream and white backgrounds with soft pastel washes (blush, sky, gold) and a faint golden stardust, warm gold accents instead of purple, and black or very dark text everywhere for easy reading. The main page opens with a large fairytale script title, "Disney Catalog", and the tagline "Where every character has a little magic." Other pages use the same decorated header with an elegant serif title. Body text uses a clean, rounded font. Cards are white with a soft pastel picture frame, rounded corners, and soft shadows, and lift with a golden glow on hover. Buttons are warm gold with dark text. Small twinkling sparkles and golden dividers add magic without crowding the page. The Mystery Reveal silhouette is midnight blue with a golden glow.

- **Catalog — main page (`/characters`):** A grid of character cards: 4 per row on desktop, 3 on tablets, 2 on phones, and 1 on very narrow screens. Only characters that appear in at least one film or TV show are listed; characters with neither are left out. Each card shows the character's image, name, and a heart button. A search box sits above the grid, and a "Load more" button sits below it.
- **Favorites (`/favorites`):** Shows only the characters the user has marked with a heart, in the same card style, without calling the API. Clicking a heart here removes the character from the page. Clicking a card expands it right here, exactly like in the catalog (it grows downward in its column and shows Films and TV Shows), at its own URL `/favorites/:id`; the ✕ button closes it and returns to `/favorites`. A favorite can be removed from its expanded card too, which closes it. A `/favorites/:id` link to a character that isn't a favorite shows the Favorites list. If there are no favorites yet, a friendly message points the user to the catalog.
- **Heart button:** a small heart in a subtle round background in the top-right corner of every card's image, on closed and expanded cards. It is an outline when the character isn't a favorite and fills pink-red when it is. Clicking it never opens or closes the card.
- **Random character (`/random`) — "Mystery Reveal":** Starts with a dark mouse-ears silhouette with a glowing question mark and a "Reveal Character" button. Clicking it plays a short magical animation (the silhouette shakes, a golden glow grows, sparkles twinkle) while a random character is loaded, then the character floats in out of a soft blur as a regular card (image, name, heart button), with a soft golden glow blooming over its picture and a burst of little sparkles around it. Below it: a "Try Again" button that reveals another character (never the same one twice in a row) and a "View Details" button. Clicking the card or "View Details" expands the card right here on `/random` (the URL doesn't change), exactly like the catalog's expandable card with Films and TV Shows; its ✕ button closes it, and the heart keeps working while it is open. Each new character starts closed. Only characters with films or TV shows are revealed, so the expanded card always has details. If the API fails, a friendly error and a "Try Again" button are shown. People who turn off animations in their system settings get a still version.
- **Character details (`/characters/:id`):** Not a separate page or a pop-up. The clicked card expands in place: it stays in its own column and grows downward, pushing the rows below it down, while every other card keeps its position and order. It shows the image, the name, and the character's **Films** and **TV Shows**. A category with no data is hidden. The rest of the catalog stays visible. When the card expands, the address bar changes to that character's URL. Opening that URL directly shows the catalog with that card already expanded and scrolled into view. The ✕ button collapses the card and returns to `/characters`. If the id in the URL matches no character, a full-page "Character not found" message with a link back to the catalog is shown instead of the catalog.

## 4. Must-have features
1. **Browse:** Show the characters from the first page of 50 that have films or TV shows. "Load more" adds the next page's characters below the ones already shown.
2. **Search by name:** Typing a name shows the characters that match it.
3. **Expandable card:** Clicking a card expands it in place and shows Films and TV Shows, only the ones with data. In the catalog and on the Favorites page the URL changes (`/characters/:id`, `/favorites/:id`); on the Random page the card expands without leaving `/random`.
4. **Favorites:** A heart button on every card adds or removes a character. Favorites are saved in the browser (localStorage), so they stay after a refresh, and they are listed on the Favorites page.
5. **Random character:** The Random page reveals a surprise character with a magical animation and can reveal another one with a single click.

All data screens show a loading message while data is on its way and a clear error message if the request fails.

## 5. Acceptance criteria
- When I open `/characters`, I see character cards with images, names, and hearts, every one of them with at least one film or TV show, and when I click "Load more", I see the next page's characters added below them.
- When I type "Mickey" in the search box, I see only characters whose names match "Mickey".
- When I click a character card, I see it expand in place with its Films and TV Shows (only the ones with data), the rest of the catalog is still visible, and the URL changes to `/characters/<id>`. When I click ✕, I see the card collapse and the URL return to `/characters`.
- When I paste a `/characters/<id>` link into a new tab, I see the catalog with that character's card expanded, and when the id doesn't exist, I see a full-page "Character not found" message with a link back to the catalog.
- When I click a heart and refresh the page, I see the character on the Favorites page, and when I click "Reveal Character" and then "Try Again" on the Random page, I see a magical reveal and then a different character each time.

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
- Random character: ask for `?pageSize=1` and read the total from `info.totalPages` (with one character per page, the number of pages is the number of characters), then ask for `?page=<random number>&pageSize=1`. Note: `info.count` is only the number of characters on the current page, not the total. With `pageSize=1` the API sends `data` as a single object, and an empty list for a position past the end. A character without films or TV shows is skipped and another position is tried (up to 8 tries).

**Fields we use:** `_id` (a number that identifies the character, used in the URL and for favorites), `name` and `imageUrl` (cards, Random page), and `films` and `tvShows` (expanded card only).

**Notes:**
- Characters don't all have the same information. Any field can be missing or empty, so only show what exists.
- **Filter:** a character is shown only if `films` or `tvShows` has at least one non-blank item. This is applied to every page that is loaded and to characters opened from a direct link (a character without films or TV shows shows "Character not found"). About 10% of characters are filtered out. If a whole page is filtered out, the next page is loaded automatically.
- **Images:** if a character has no `imageUrl`, or its image fails to load, show the Mickey silhouette placeholder. The image server answers a missing image with a 404 status but still sends a grey 300×171 "not found" picture. For images of exactly that size, the app asks the server for the real status (a HEAD request, which the server allows from other sites) and shows the placeholder only if the answer is not OK.
- When `info.nextPage` is empty, there are no more characters, so the "Load more" button is hidden.
- Asking for one character by id returns that character as a single object. An id that doesn't exist returns an empty list, not an error. A non-numeric id (like `abc`) returns the normal list, so the app treats it as "not found" without calling the API.
- When a search matches exactly one character, the API returns that single character instead of a list. The app needs to handle both cases.
- **Search:** the API matches part of the name and ignores upper/lower case ("mi" finds 380 characters over 8 pages), so search results are paginated with "Load more" and filtered like the normal list. Spaces at the ends change the results ("Elsa " finds fewer than "Elsa"), so the search text is trimmed. The `nextPage` link in a search answer leaves out the name, so the app builds each page's URL itself.
- Favorites store enough information (id, name, image, films, TV shows) to show the Favorites page and its expanded cards without calling the API again.
