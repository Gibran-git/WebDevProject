


### #3 - Met.js in-memory cache
- **Date:** 2026-11-10
- **Member:** DJ Leamen
- **Tool / model:** GitHub Copilot (free - student)
- **Files:** `src/api/met.js`
- **Prompt (verbatim):**

  ```
  given met.js, add two in-memory caches so we don't repeat requests the app has already made. one for search results by query, and one for artwork details by id. search cache should remember which artwork ids each search returned, artwork cache should keeps each artwork after its details load, and errors should never be cached. retry search if request gets a 403 or network err
  ```

- **What it produced & what I changed:** It produced the `searchCache` and `objectCache` maps plus the lookups and writes in `searchIds` and the `fetchArtworks` detail loop. I kept the cache logic, read through it line by line to understand it, and added the comments. I removed the automatic retry it generated, errors are never cached so a failed search or artwork is simply requested again the next time it is needed.

### #4 - CollectionControls component
- **Date:** 2026-11-11
- **Member:** DJ Leamen
- **Tool / model:** GitHub Copilot (free - student)
- **Files:** `src/components/CollectionControls.jsx`
- **Prompt (verbatim):**

  ```
  given App.jsx, build a reusable and fully controlled collection controls component with no local state / api calls. props: searchInput, onSearchInputChange, onSearchSubmit, onClearSearch, activeQuery, era, onEraChange, movement, onMovementChange, movements, sortKey, onSortChange. include a role="search" form with an accessibly labeled, controlled search input (sensible placeholder and input limits per best practices) and a submit button, plus a "Clear search" button shown only when activeQuery is set that calls onClearSearch. add era and movement dropdowns (movement populated from the movements prop) and a "Sort by" dropdown with Relevance, Title (A–Z), Title (Z–A), Artist (A–Z), Date (oldest first), and Date (newest first). css classes are provided
  ```

- **What it produced & what I changed:** It produced the component and everything I asked for in it incl. the search form, the era / category dropdowns, and the sort. I kept the logic as generated, read through it to confirm it holds no state and doesn't use an API, and added the comments. Tested and validated.


### #5 -  Debugging Community Boards and Discussion posts
- **Date:** 2026-11-20
- **Member:** Brandon Dias
- **Tool / model:** claude free model
- **Files:** src/components/SiteHeader.jsx, src/components/communityBoards.jsx, src/components/AccountPage.jsx, src/components/DiscussionThreads.jsx, and src/App.jsx
- **Prompt (verbatim):**

  ```

  WebDevProject.zip
  ZIP
  This is the repo for my project im working on. I tried implementing a community board feature and a discussion thread for each piece of art but I am running into errors where it isnt showing, and clicking on an art piece just leaves the page blank. Can you help me debug the errors in my code to fix these issues so that I can view community boards users have made and the discussion threads under each artpiece details page?

  ```


- **What it produced & what I changed:** 

It showed me that I forgot to add backLabel, threads, onAddThread, and onAddReply as paramaters to my ArtworkDetail function which is what was causing the blank page when I clicked on artwork. It also pointed out a couple variables and headers that I had mispelled or forgot to capitilize in multiple files (SiteHeader.jsx, communityBoards.jsx, AccountPage.jsx, DiscussionThreads.jsx, and App.jsx) such as <dive> instead of <div>, <spawn> instead of <span>, arialabelled instead of aria-labelled and spelling color as colour, all causing errors and some being why the header layout was broken. It also showed me that there was no commmunity board or account page button which I didnt realize I forgot to add, so I created those inside SiteHeader.jsx.


### #6 - Local Storage implementation
- **Date:** 2026-11-21
- **Member:** Brandon Dias
- **Tool / model:** Claude free model
- **Files:** src/App.jsx
- **Prompt (verbatim):**

  ```
  How would I go about preventing discussion posts, and saved art pieces from resetting when I refresh the page?
  
  ```

- **What it produced & what I changed:** 

It told me to store everything in the browser's localStorage so I had to change a couple lines to grab and send savedArtwork or thread to and from the browser's localStorage so it doesnt get reset when refreshing the page. I also had to add to useEffects() so that whenever you add or remove a saved art piece or thread it will automatically save or delete the savedArtwork or thread data from the browser localStorage


### #7 - Debugging Adding Community Boards and editing posts
- **Date:** 2026-11-22
- **Member:** Brandon Dias
- **Tool / model:** claude free model
- **Files:** `src/components/OptionsMenu.jsx, src/components/CommunityBoards.jsx, src/styles.css, src/components/DiscussionThreads.jsx, src/App.jsx, src/components/AccountPage.jsx
- **Prompt (verbatim):**

  ```
  WebDevProject.zip
  ZIP
  This is the updated repo. I cleaned up the UI by removing the extra search bar, and the saved art count at the top. I then tried adding a button to allow you to create your own community board from pieces you have saved. I also tried to add a feature where you can edit or delete your discussion threads, community board and/or replies. The issue is that whatever I did causes the website to load the main page fine but goes blank whenever I try using any of these features. Can you explain to me what I need to do to fix the bugs in my code?

  ```

- **What it produced & what I changed:** 

I had around 15 typos total in the code I made for the features which is why whenever I tried to switch off the main page to use one of the features the website would just go blank. The AI showed me each spelling mistake and once I fixed those the website worked as intended. It also gave me a suggestion to add a preventDefault in the DiscussionThreads handlesubmit file so that the page doesnt refresh whenever you save your edit.


### #8 - Improve Edit Board UI
- **Date:** 2026-11-22
- **Member:** Brandon Dias
- **Tool / model:** claude free model
- **Files:** `src/components/AccountPage.jsx, src/App.jsx, src/styles.css
- **Prompt (verbatim):**

  ```
  The UI I made for when you create/edit your board looks awful. Can you help me with doing a full overhaul of the UI for this page? What I want for the page is you should have a place to put the title, a place to put the description, maybe like a little switch icon thing that switches left, showing private and right, showing public, for the visibility of the board if possible. If its not possible you can just leave that how I had it. Then I want it so you can click a button titled "Add artwork to Board" and then a pop-up page appears showing you your saved art, but you can also search and select art you don't have saved. Then the ones you select appear in a row with their name similar to how I have it now. and finally you can select which to use for the cover art where only one should be able to be selected at a time. I will attach my current repo folder so you understand what im working with right now.

  ```

- **What it produced & what I changed:** 

My old code just overall looked very barebones and didnt fit the cleaner look of the rest of the website. So I gave up on trying to improve it and used what the AI suggested with very minimal edits, I just tweaked a couple things after the fact to get it to how I wanted it to look. The AI replaced my old BoardForm function with a new BoardForm for the new UI, it also replaced the board form css, and added a searchArtworks function in App.jsx and fixed handleToggleSave so that saving a searched piece from a board wont crash the page.


### #9 - Remove references and download from Met
- **Date:** 2026-11-22
- **Member:** DJ Leamen
- **Tool / model:** GitHub Copilot (free - student)
- **Files:** `src/data/artworks.js, src/data/met-paintings.json, public/images/*`
- **Prompt (verbatim):** 

  ```
  remove all references of chicago api in code and on the frontend. then download several images from met api and put them into public/images, replacing what's currently there.
  our end goal will be to only display these images only when the Met API fails or times out.
  don't touch src/components or Art.jsx. you can advise what next steps to take based on your own changes, but don't implement
  ```

- **What it produced & what I changed:** It used cURL and Playwright to download a bunch of images (12.4 MiB total) without triggering Met's limits. It then created src/data/met-paintings.json, which is useful to have, but it made artworks.js load the catalog instead of holding hand-written data, so it also rewrote artworks.js and included a new OfflineImagesContext using React createContext. I fixed met.js, created a new loadCollection in Art.jsx helper to replace the old fetch/timeout/fallback code and updated communityBoards.js starter threads so that the thread data only uses what we have available to us in case Met is unavailable, then did some googling to refresh myself again on the Context object and updated the now outdated offline image handling in src/components using this new OfflineImagesContext. I made sure ArtworkCard passed the whole artwork when saving, ArtworkDetail no longer hardcodes the Chicago museum name, and countPage's artwork piscker was updated for the new search result format and shows a new offline message. Also updated public/images/README.md


### #10 - Automated tests for DiscussionThreads and BoardForm
- **Date:** 2026-11-24
- **Member:** Gibran
- **Tool / model:** Gemini (free)
- **Files:** `src/test/forms.test.jsx`
- **Prompt (verbatim):**

  ```
  I want to add automated component tests for our controlled forms in DiscussionThreads.jsx and AccountPage.jsx (BoardForm) using Vitest and React Testing Library, testing both empty-input validation and valid submissions. Walk me through how vi.fn() mock functions, render(), screen queries, and MemoryRouter work step by step so I can write and debug the tests myself.
  ```
- **What it produced & what I changed:** I used it to break down how Vitest mock functions (vi.fn), React Testing Library queries, and MemoryRouter work so I could write the tests. I wrote both form validation tests in forms.test.jsx, checking that submitting empty fields triggers the validation alert and blocks the submit handlers. I also made sure that valid inputs submit properly and reset the inputs. While running the tests I hit a few failures from typos and casing issues, like accidentally writing textcontent in all lowercase with an extra space so it returned undefined, and using a lowercase plain string in .toMatch() that failed because the actual alert message starts with a capital P. Once I fixed textContent and changed the matcher to a case-insensitive regex (/please enter a title and message/i), both tests passed. 