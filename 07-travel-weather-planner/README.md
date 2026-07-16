# SkySense — Smart Weather Companion

A streamlined React + Vite weather app powered by the free Open-Meteo APIs.

## What changed in version 2

- Fixed the continuous saved-cities/localStorage render loop that caused the app to freeze over time.
- Added in-memory and session caching for weather, geocoding, and air-quality requests.
- Deduplicated matching API calls and added request timeouts with friendly saved insights.
- Debounced localStorage writes.
- Removed duplicate or low-value modules: simulated alerts, travel duplication, weather journal, weekly-summary storage, and excessive activity history.
- Added route-level lazy loading so pages load only when opened.
- Removed external font loading.
- Added lightweight local SVG sky backgrounds and transform-based animations.
- Simplified private navigation and improved mobile layouts.

## Kept features

- Live city search
- Current weather
- Hourly forecast
- Seven-day forecast
- Saved cities
- Air quality
- Weather comfort score
- Activity planner
- Compare 2–4 cities
- Signup/login and preferences
- Dark/light theme
- Friendly fallback weather

## APIs

SkySense uses free Open-Meteo endpoints without a private key:

- `https://geocoding-api.open-meteo.com/v1/search`
- `https://api.open-meteo.com/v1/forecast`
- `https://air-quality-api.open-meteo.com/v1/air-quality`

## Run the project

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173`.

## Build verification

```bash
npm run lint
npm run build
npm run preview
```

## Important extraction note

After extracting the ZIP, run commands in the folder that directly contains `package.json`, `src`, and `public`.
