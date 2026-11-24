# Community Cleanup

An Expo + React Native prototype for coordinating neighborhood trash cleanups. The first iteration uses local mock data and deliberately avoids paid or hosted services.

## Included

- Expo SDK 58, React Native, and strict TypeScript
- Expo Router with Map, My Cleanups, Profile, and Admin tabs
- An interactive OpenStreetMap view bounded to Downingtown with 554 locally stored, clickable block segments
- Persistent street claiming and releasing that updates My Cleanups immediately on the current device
- Territory gameplay with two switchable mock personas, player colors, 10-point block captures, and a live leaderboard
- Photo-gated territory claims and takeovers with locally recorded proof time and source
- A server-backed AI Territory Coach that reviews territory, nearby expansion options, and competition

## AI Territory Coach

The mobile/web client never receives the OpenAI API key. The Coach calls the server-only route at `src/app/api/territory-review+api.ts`, which reads `OPENAI_API_KEY` from the server environment.

For local development:

1. Create an OpenAI project API key in the OpenAI Platform dashboard. API billing is separate from a ChatGPT subscription.
2. Copy `.env.example` to `.env.local`.
3. Put the key only in `.env.local`; never use an `EXPO_PUBLIC_` prefix for it.
4. Set `AI_ENABLED=true`, restart Expo, and open the Coach tab.

For an Expo Hosting preview, add these project environment variables in the Expo dashboard for the `preview` environment:

- `OPENAI_API_KEY`: secret
- `OPENAI_MODEL`: plain text, currently `gpt-6-luna`
- `AI_ENABLED`: plain text, `true`

Then export and deploy using the preview environment:

```sh
npx expo export --platform web
npx eas-cli@latest deploy --environment preview
```

The mock route limits request size, output length, and requests per process. Before opening the app to a larger audience, add real authentication and a durable per-user rate limiter. Configure a low project budget and usage alerts in the OpenAI Platform dashboard.
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
