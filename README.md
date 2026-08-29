# SRJC Baja SAE Website

Official source for the SRJC Baja SAE website.

The site is a static React + Vite + TypeScript project with custom CSS. Public content is maintained in `src/content.ts`, calendar data is generated from Canvas, and public assets live under `public/`.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

Node 22 is used in GitHub Actions and is the recommended local version. If you use `nvm`, run `nvm use` from the repository root.

## Local development

```bash
npm ci
npm run dev
```

## Validation

Before pushing changes, run:

```bash
npm run validate
npm audit
```

`npm run validate` runs the linter, TypeScript check, and production build. GitHub Actions runs the same validation on pushes to `main` and on pull requests.

## Project structure

- `src/App.tsx` - page structure and interactive UI
- `src/content.ts` - sponsors, subteams, social links, gallery metadata, and team updates
- `src/calendar.ts` - calendar filtering and display formatting
- `src/generated/calendar-events.json` - generated public event data
- `src/styles.css` - site styles and responsive layout
- `scripts/sync-calendar.mjs` - Canvas calendar API sync and static-data generator
- `public/` - static assets, redirects, sitemap, robots file, and sponsorship package
- `.github/workflows/` - validation and Canvas calendar synchronization

## Canvas calendar sync

`.github/workflows/calendar-sync.yml` periodically syncs public schedule events from the SRJC Baja SAE Canvas course calendar and all seven subteam group calendars into `src/generated/calendar-events.json`.

The workflow requires the repository secret `CANVAS_API_TOKEN`. It should be a read-only Canvas token scoped to `GET /api/v1/calendar_events`. Do not commit the token or other credentials to the repository. If the Canvas instance enforces token expiration, rotate the secret before it expires.

## Deployment

The project builds as a static site. GitHub Pages and production DNS are configured separately from the source repository so deployment can be validated before `srjcsaeclub.org` is cut over.

## Licensing and third-party assets

No repository-wide open-source license is currently granted. Third-party photographs, sponsor logos, organization marks, and other assets retain their respective licenses or ownership. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for details.
