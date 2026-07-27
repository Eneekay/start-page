# Start Page

A personal browser start page: frosted glass design, a live clock, an interactive
particle-network background, and quick links to daily web tools. Built with
Bootstrap and the same colour/type theme as [nekarantanis.co.uk](https://nekarantanis.co.uk).

## Features

- Large digital clock with the current date underneath
- Animated background: a mouse-reactive particle network, drifting frosted
  blobs, and a dot-grid, all in the site's navy/sky-blue/gold palette
- Frosted glass ("glassmorphism") panels throughout
- Quick-link tiles to Gmail, Claude AI, Gemini AI, OneDrive, Google Drive,
  Ground News, and Google News

## Local preview

This is a static site with no build step. Open `index.html` directly in a
browser, or serve the folder locally, e.g.:

```
python3 -m http.server 8080
```

then visit `http://localhost:8080`.

## Deploying with GitHub Pages

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
3. Choose the `main` branch and `/ (root)` folder, then save.
4. GitHub will publish the site at `https://eneekay.github.io/start-page/`.

## Using it as your browser start page

Once deployed, set the published URL as your browser's home page / new-tab
page in your browser's settings.
