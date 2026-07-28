# ScaleUp Tech Platform

The bilingual public website for ScaleUp Tech and its products:

- JobPilot
- ScaleCX
- Pharmacy Manager

## Requirements

- Node.js 20 or newer
- npm

## Local validation

```bash
npm test
```

The build is written to `dist/` and contains static files suitable for deployment on Hostinger or another static hosting provider.

## Project structure

- `src/content.mjs` — product and site content
- `src/render.mjs` — accessible HTML templates
- `src/styles.css` — responsive visual system
- `src/site.js` — language and navigation interactions
- `scripts/build.mjs` — deterministic static-site build
- `scripts/check.mjs` — route, metadata, and internal-link validation

## Security

Do not commit credentials or environment files. `.env` variants are ignored by default.
