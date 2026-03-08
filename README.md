# Alphaducation Library (Static PWA)

A premium, mobile-first educational library built with plain HTML, CSS, and vanilla JavaScript.

## Project Structure

- `index.html` Home with hero, featured resources, install prompt, recent uploads, and live search
- `newspapers.html` Newspapers library view
- `webbooks.html` Web-books library view
- `toolbox.html` Toolbox library view
- `workshops.html` Workshops library view
- `downloads.html` Download center view
- `about.html` About page
- `contact.html` Contact page
- `offline.html` Offline fallback page
- `404.html` Not-found page
- `assets/css/main.css` Shared design system and responsive styles
- `assets/js/library.js` Data helpers and reusable utility functions
- `assets/js/main.js` Card rendering, filtering, search, install button logic
- `assets/js/pwa.js` Service worker registration
- `service-worker.js` App-shell caching and offline behavior
- `manifest.webmanifest` PWA metadata, icons, and shortcuts
- `data/library.json` Single source of truth for all library items

## How To Add A New Newspaper

1. Open `data/library.json`.
2. Add a new object inside `resources` with:
   - `category`: `"Newspapers"`
   - `type`: usually `"pdf"` or `"html"`
   - `format`: for example `"PDF"`
   - `title`, `description`, `cover`, `tags`, `url`, `uploadedAt`
3. Save the file and refresh the site.

Example:

```json
{
  "id": "news-weekly-010",
  "title": "Math Weekly",
  "type": "pdf",
  "format": "PDF",
  "category": "Newspapers",
  "cover": "assets/images/covers/newspaper.svg",
  "description": "Weekly math highlights.",
  "tags": ["math", "weekly"],
  "featured": false,
  "url": "https://example.com/math-weekly.pdf",
  "uploadedAt": "2026-03-08"
}
```

## How To Add A New Web-book

1. Create the HTML content file in `assets/resources/` (for example `my-webbook.html`).
2. Add an item in `data/library.json`:
   - `category`: `"Web-books"`
   - `type`: `"html"`
   - `format`: `"HTML"`
   - `url`: path to your file (for example `assets/resources/my-webbook.html`)

## How To Add A Toolbox File

1. Put the file in `assets/resources/` if hosted locally (PDF/ZIP/HTML).
2. Add a resource object in `data/library.json`:
   - `category`: `"Toolbox"`
   - `type`: `"zip"`, `"pdf"`, `"html"`, or `"external"`
   - `format`: matching label such as `"ZIP"` or `"PDF"`

## Change Colors Or Logo

1. Open `assets/css/main.css`.
2. Edit color variables inside `:root`:
   - `--color-brand`
   - `--color-brand-deep`
   - `--color-accent`
3. Replace icons in `assets/icons/`:
   - `icon-192.png`
   - `icon-512.png`
   - `maskable-512.png`
4. Replace social preview image: `assets/images/social-preview.png`.

## Run Locally

Use any static server (recommended so service worker works).

```bash
# Node example
npx serve .
```

Then open the shown local URL.

## Deploy To GitHub Pages

1. Push this project to a GitHub repository.
2. In GitHub, open `Settings` > `Pages`.
3. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main` (or your branch)
   - Folder: `/ (root)`
4. Save and wait for deployment.
5. Update `sitemap.xml` and `robots.txt` with your real domain.

## Deploy To Netlify

1. Log in to Netlify and choose `Add new site` > `Import an existing project`.
2. Connect your Git repository.
3. Build settings:
   - Build command: *(leave empty)*
   - Publish directory: `.`
4. Deploy site.
5. Update `sitemap.xml` and `robots.txt` with your Netlify/custom domain.

## Notes For Beginners

- The site content is entirely controlled by `data/library.json`.
- If a card is missing, check JSON commas and quote marks.
- The filter/search UI is automatic and reads values from your data.
- The app caches core pages for offline use through `service-worker.js`.
