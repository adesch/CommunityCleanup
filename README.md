# Community Cleanup

An Expo + React Native prototype for coordinating neighborhood trash cleanups. The first iteration uses local mock data and deliberately avoids paid or hosted services.

## Included

- Expo SDK 58, React Native, and strict TypeScript
- Expo Router with Map, My Cleanups, Profile, and Admin tabs
- An interactive OpenStreetMap view bounded to Downingtown with 554 locally stored, clickable block segments
- In-session street selection and claiming that updates My Cleanups immediately
- Placeholder claim, before/after photo, history, and volunteer-assignment flows
- Shared types, mock data, theme tokens, and reusable components under `src/`

## Project structure

```text
src/
  app/          File-based routes and tab navigation
  components/   Reusable interface components
  data/         Mock data (future backend boundary)
  theme/        Shared color tokens
  types/        Domain models
```

## Run locally

Install the current Node.js LTS release, then:

```sh
npm install
npm start
```

Use `npm run ios`, `npm run android`, or `npm run web` for a specific platform. Physical-device support depends on which Expo SDK version is supported by the installed Expo Go app.

## Checks

```sh
npm run typecheck
npm run lint
```

## Planned integrations

Supabase authentication, database, and photo storage plus Mapbox rendering are intentionally not configured. The mock data and stylized map can later be replaced behind dedicated service and map components once product decisions around streets versus larger cleanup areas are settled.
