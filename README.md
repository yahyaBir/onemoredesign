# One More Design — site

Static, dependency-free site for One More Design. The published HTML files are generated from shared partials so the header, mobile menu and footer have one source of truth.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Editing pages

- Shared header/menu: `src/partials/header.html`
- Shared footer: `src/partials/footer.html`
- Page metadata, styles and scripts: `src/pages.json`
- Page body content: `src/pages/*.main.html`
- Head skeleton: `src/layout.html`

After changing any source file, rebuild the HTML:

```bash
python3 build.py
```

Do not edit the generated root `*.html` files directly; the next build overwrites them.

## Checks

```bash
python3 build.py --check      # generated HTML is current
python3 scripts/check_site.py # links, fragments, IDs, image dimensions, ARIA controls
```

`scripts/check_site.py` uses only the Python standard library and is suitable for CI.

## Structure

- `css/style.css`: design tokens, homepage sections, shared navigation and components.
- `css/pages.css`: detail and contact page layout plus the project media column.
- `js/main.js`: mobile menu, header scrolling, hero video and both timelines.
- `js/project.js`: project gallery slider.
- `js/project-media.js`: per-project image/video configuration.
- `js/references.js`: reference carousel with a static no-JS grid fallback.
- `js/contact.js`: form validation, mail draft and clipboard fallback.

Asset URLs are versioned with a content hash by `build.py`.

## Media

See `MEDIA.md` for the media layout. `images/originals/` and `videos/originals/` are source material and should be excluded from the deployed site. Optimised project images and the two hero videos are the published assets.
