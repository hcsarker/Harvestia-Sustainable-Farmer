<div align="center">

# 🌾 Harvestia: Sustainable Farmer

Sustainable Agriculture • Simulation • NASA Data • Gamified Learning

</div>

---

## 1. Overview

Harvestia is a cross‑platform (Web + Mobile) learning and decision-support platform for sustainable agriculture. It combines satellite data, interactive simulation, structured learning content, and gamification to help users adopt climate‑smart practices.

If you want a concise executive + technical snapshot, see `PROJECT_SUMMARY.md`.

---

## 2. Core Features

| Category               | Feature                                              | Summary                                                            |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| Dashboard              | Farming modules & KPIs                               | Crop yield trends, weather, sustainability stats                   |
| Simulation             | Weekly crop + resource management                    | Choose crop, soil, location, make decisions, view outcomes         |
| NASA Data              | MODIS / SMAP / GISS / OCO-2 / Landsat visualizations | Remote sensing insights for moisture, vegetation, temperature, CO₂ |
| Learning               | Courses + progress + certificates                    | Structured curriculum with completion tracking                     |
| Story Journey          | Chapter-based narrative                              | Unlock chapters, track story progress via Supabase                 |
| Mini-Games             | Strategy / quiz / optimization                       | Reinforce learning with engagement loops                           |
| Profile & Achievements | Badges, XP, activity feed                            | Motivation and retention mechanics                                 |
| Auth & Session         | Supabase auth (persisted)                            | Email/anon sessions, ready for future providers                    |
| Edge Functions         | `nasa-data`, `quiz-handler`                          | Secure backend logic + API proxying                                |

---

## 3. Tech Stack

**Web**: Vite, React 18, TypeScript, Tailwind CSS, shadcn-ui, React Router, React Query, recharts, deck.gl, maplibre-gl

**Mobile (in progress)**: Expo (React Native), React Navigation, TypeScript

**Backend / Infra**: Supabase (Postgres, Auth, Edge Functions, Storage)

**Data & Visualization**: NASA datasets (proxied), custom hooks, charts, geospatial layers

**Utilities**: lucide-react icons, embla-carousel, date-fns

---

## 4. Repository Structure

```
supabase/              # SQL migrations + edge functions
src/                   # Web application source
    components/          # Reusable UI + feature components
    pages/               # Route-level containers
    hooks/               # Custom data & logic hooks
    integrations/supabase# Generated types + client
mobile/                # Expo React Native app scaffold
PROJECT_SUMMARY.md     # Executive + technical overview
```

`shared/`: Added `src/shared/simulation` containing framework‑agnostic pure logic (types + engine) to be shared by web + mobile.

---

## 5. Environment Variables

Create a `.env` (web) and `.env.local` or `.env` (mobile) with:

```
# Web (Vite) – prefix required
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Mobile (Expo) – PUBLIC prefix for exposure
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Never commit real keys. Rotate the existing hardcoded anon key and remove it from source if still present.

---

## 6. Setup & Installation

### Web App

```bash
git clone <REPO_URL>
cd Harvestia-Sustainable-Farmer
npm install
cp .env.example .env  # then fill values
npm run dev
```

### Mobile (Expo)

```bash
cd mobile
npm install
cp ../.env.example .env     # or create new with EXPO_PUBLIC_* vars
npm start
```

Use Expo Go or an emulator to preview.

---

## 7. Development Workflow

1. Branch naming: `feature/<name>` or `fix/<name>`
2. Run `npm run lint` before committing
3. Keep hooks pure; side effects inside `useEffect`/service wrappers
4. Prefer React Query for async data
5. Use edge functions for any external API that needs protection

Recommended future scripts:

```
npm run typegen   # (planned) regenerate Supabase types
npm run test      # (planned) run unit tests
```

---

## 8. Simulation Module (High-Level)

State tracks: mode, crop, soil, location, week, budget, decisions, outcomes. Extend by extracting pure calculation helpers (e.g., yield model, moisture balance) into `shared/simulation/` for reuse.

Planned Enhancements:

- Deterministic seed-based scenarios
- Constraint validation (budget / resource caps)
- Performance profiling with memoized selectors

---

## 9. NASA Data Integration

- Client calls Supabase edge function `nasa-data`
- Function proxies & normalizes responses
- Hooks (`useNASAData`) provide loading/error states

Future:

- Local caching layer (React Query cache hydration)
- Rate limiting & fallback dummy dataset
- Expand parameterization (date ranges, bounding boxes)

---

## 10. Mobile Parity Roadmap

| Phase | Scope                                          |
| ----- | ---------------------------------------------- |
| 1     | Auth + Dashboard snapshots                     |
| 2     | Courses + Story Journey (read-only)            |
| 3     | Mini-games + Achievements                      |
| 4     | Simplified Simulation input & result summary   |
| 5     | Offline caching (courses + last NASA snapshot) |

---

## 11. Testing Strategy (Planned)

- Unit: hooks (auth, NASA, simulation math)
- Integration: page flows (auth → dashboard → course)
- Edge Functions: contract tests using mocked NASA responses
- Visual: Storybook or Ladle (future) for component states

---

## 12. Performance Notes

- Dynamic import heavy map/chart components
- Use stable key partitioning in React Query
- Memoize expensive derived stats in simulation
- Consider Web Worker / Off-main-thread for heavier calculations

---

## 13. Security & Compliance

- Enforce RLS policies for user tables
- Edge function proxy for external APIs (no direct keys client-side)
- Input validation + throttling for data fetch parameters
- Rotate Supabase anon key if leaked historically

---

## 14. Contributing

Contributions welcome! If adding domain logic, aim for framework-agnostic modules placed (future) under `shared/`. Submit PRs with a concise description + screenshots (if UI).

---

## 15. License

MIT License. See `LICENSE` (add if missing).

---

## 16. Attribution & Inspiration

Uses open satellite data concepts (NASA / remote sensing). All data usage should respect respective API terms.

---

## 17. Quote

> “The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings.” — Masanobu Fukuoka

---

For strategic overview: read `PROJECT_SUMMARY.md`.

Happy building 🌱
