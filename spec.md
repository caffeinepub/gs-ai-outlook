# GS AI Outlook

## Current State
A full-stack email/productivity web app running on the Internet Computer with React frontend and Motoko backend. Has inbox, calendar, tasks, and AI simulation features. No PWA support currently.

## Requested Changes (Diff)

### Add
- `public/manifest.json` with app name, icons, theme color, display mode standalone, start URL
- `public/sw.js` service worker with basic offline caching strategy (cache-first for static assets)
- PWA meta tags in `index.html`: theme-color, apple-mobile-web-app-capable, apple-touch-icon, manifest link
- App icons: 192x192 and 512x512 PNG icons in public/

### Modify
- `index.html` to include manifest link, PWA meta tags, and service worker registration script
- `vite.config.js` no changes needed (manual PWA, no vite-plugin-pwa)

### Remove
- Nothing

## Implementation Plan
1. Add manifest.json to src/frontend/public/
2. Add service worker sw.js to src/frontend/public/
3. Update index.html with manifest link, PWA meta tags, SW registration
4. Place generated icons in src/frontend/public/
