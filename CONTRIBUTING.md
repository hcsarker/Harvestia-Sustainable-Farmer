# Contributing to Harvestia

Thanks for your interest in contributing! This guide will help you get productive quickly.

## 🧱 Architecture Snapshot

- **Web**: React + Vite + TypeScript + Tailwind + shadcn-ui
- **Mobile**: Expo (React Native) scaffold
- **Backend**: Supabase (Auth, DB, Edge Functions)
- **Domain**: Simulation engine, NASA data integration, gamified learning flows

## 🛠 Local Setup

```bash
git clone <REPO_URL>
cd Harvestia-Sustainable-Farmer
cp .env.example .env        # fill values
npm install
npm run dev
```

Mobile:

```bash
cd mobile
cp .env.example .env        # fill EXPO_PUBLIC_* values
npm install
npm start
```

## 🗂 Branch Strategy

| Type    | Pattern         | Example                   |
| ------- | --------------- | ------------------------- |
| Feature | feature/<scope> | feature/simulation-scorer |
| Fix     | fix/<issue>     | fix/nasa-null-response    |
| Chore   | chore/<task>    | chore/update-deps         |
| Docs    | docs/<area>     | docs/readme-mobile        |

## ✅ Pull Request Checklist

- Descriptive title + summary
- Screenshots / GIFs for UI changes
- No leftover console logs (except intentional)
- `npm run lint` passes
- Types are clean (no new TS errors)
- Updated docs if behavior changed

## 🧪 Testing (Planned Expansion)

- Unit: pure functions in `src/shared` / hooks
- Edge: mock Supabase functions responses
- Visual: consider Storybook/Ladle (future)

## 🔐 Security & Keys

- Never commit real Supabase anon/service keys
- All external API calls should route through Edge Functions if secrets involved

## 🧩 Code Style

- Prefer functional, composable hooks
- Keep components small; extract sub-parts over conditional clutter
- Use `React.Query` for async server state; avoid duplicating caches
- Co-locate types with domain logic (e.g., `shared/simulation/types.ts`)

## 🌀 Simulation Contributions

When modifying the simulation:

1. Keep math & rules **pure** (no React imports) in `shared/simulation`
2. Add tests (if harness present) before refactors
3. Version breaking model changes (`v1`, `v2` folders) if needed

## 🛰 NASA Data Layer

- Add new dataset adapters via extension functions (avoid bloating hook)
- Normalize response shape `{ meta, series, stats }`

## 🧩 Commit Messages (Conventional-ish)

Format:

```
feat: add drought stress calculation to simulation scorer
fix: handle null vegetation index from MODIS
chore: bump deck.gl version
```

## 🗺 Roadmap Reference

See `PROJECT_SUMMARY.md` for phased goals. Align large features to a roadmap phase.

## 💬 Communication

- Use PR comments for design discussion
- Open draft PR early for visibility

## 🙏 Thanks

Your help grows the platform—literally. 🌱
