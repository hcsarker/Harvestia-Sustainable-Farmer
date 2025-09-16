# Harvestia: Project Summary

## 1. Executive Overview

Harvestia is a cross-platform (Web + Mobile) learning, simulation, and decision-support platform for sustainable agriculture. It blends educational content, satellite-driven insights, interactive simulations, and gamification to help users (students, farmers, enthusiasts) adopt climate‑smart farming practices.

## 2. Core Value Propositions

- Data-informed farming decisions using NASA & remote sensing sources.
- Engaging learning pathways (Courses + Story Journey + Certifications).
- Scenario-based crop & resource management simulation.
- Gamified retention via achievements, mini-games, progress tracking.

## 3. Primary User Flows

1. Onboard / Auth (email, guest, or later social) → dashboard modules.
2. Explore dashboard insights (yield trends, weather, sustainability indicators).
3. Consume learning content (courses) → earn certificates.
4. Progress through Story Journey (chapter unlocking logic + data-driven tasks).
5. Run Simulation (choose crop, location, soil, apply decisions, view outcomes).
6. Use NASA Data visualizations to interpret environmental conditions.
7. Play mini-games to reinforce concepts and earn XP.
8. Track achievements & profile metrics.

## 4. Feature Inventory (High-Level)

| Domain                  | Feature                            | Status (Web) | Planned (Mobile)      |
| ----------------------- | ---------------------------------- | ------------ | --------------------- |
| Auth & Session          | Email/guest + session persist      | ✅           | 🔄 (SessionContext)   |
| Dashboard               | Metrics, charts, farming modules   | ✅           | 🔄                    |
| Courses                 | Cards, progress, metadata          | ✅           | 🔄                    |
| Story Journey           | Chapters + lock/progress           | ✅           | 🔄                    |
| Simulation              | Weekly loop, decisions, outcomes   | ✅           | 🔄 (phased)           |
| NASA Data               | Fetch + charts (MODIS, SMAP, etc.) | ✅           | 🔄 (simplified first) |
| Mini-Games              | Listing + metadata                 | ✅           | 🔄                    |
| Profile & Achievements  | Stats, badges, activity log        | ✅           | 🔄                    |
| Certificates            | Listing / progress                 | ✅           | 🔄                    |
| Supabase Edge Functions | `nasa-data`, `quiz-handler`        | ✅           | 🔄 (re-use)           |

Legend: ✅ implemented, 🔄 planned / in progress.

## 5. Technology Stack

- Frontend (Web): React + Vite + TypeScript + shadcn-ui + Tailwind + React Query + React Router.
- Mobile: Expo (React Native) + React Navigation + TypeScript.
- Data & Auth: Supabase (Postgres, Auth, Edge Functions, Storage).
- Visualization: `recharts`, `deck.gl`, `maplibre-gl`, `react-map-gl`.
- State/Data Fetch: React Query abstraction + custom hooks.
- NASA Data Integration: via Supabase Edge Function proxy (`nasa-data`).

## 6. Architecture Overview

- `src/components`: Presentational + interactive UI components.
- `src/pages`: Route-level containers orchestrating hooks + components.
- `src/hooks`: Data + state abstractions (auth, NASA data, progress, quiz security).
- `src/integrations/supabase`: Generated types + client setup.
- `supabase/`: Migrations + edge functions for server logic.
- `mobile/`: Parallel Expo app scaffold; will gradually mirror core flows.

Recommended future separation: `shared/` for pure logic (simulation engine, scoring, formatting) reused by web + mobile.

## 7. Data Concerns & Extensibility

- Supabase tables: story chapters, quiz data, user progress (implied — validate schema).
- Edge functions insulate external API keys (NASA endpoints) from client exposure.
- Add rate limiting & caching layer for expensive Earth observation requests.
- Introduce versioned simulation configs (e.g., `/configs/simulation/v1.json`).

## 8. Security & Compliance Notes

- Move current hardcoded Supabase anon key into environment variables (`.env`, `EXPO_PUBLIC_*` for mobile, `VITE_*` for web).
- Enforce RLS (Row Level Security) policies for user-specific tables.
- Sanitize / throttle user inputs for NASA data queries to avoid abuse.

## 9. Performance Considerations

- Lazy-load heavy visualization components (maps, charts) using dynamic imports.
- Memoize computed simulation aggregates.
- Batch network calls in React Query with proper stale times.
- Consider Web Workers for simulation crunching in later phases.

## 10. Mobile Rollout Phases

1. Foundation: Auth + Dashboard summaries + read-only NASA previews.
2. Learning: Courses + Story Journey lite.
3. Interaction: Mini-games (native redesigned) + Achievements.
4. Simulation (Mobile Optimized): Input wizard + summarized outcomes.
5. Offline Mode: Cache course content + last NASA fetch snapshot.

## 11. Roadmap (Suggested)

- Short Term (Weeks 1–2): Env cleanup, shared logic extraction, secure keys.
- Mid Term (Weeks 3–6): Mobile feature parity (Courses, Story, basic NASA charts).
- Long Term (6+ Weeks): Advanced simulation parity + offline + analytics dashboards.

## 12. KPIs / Success Metrics

- DAU & retention (web + mobile).
- Course completion rate.
- Simulation session length.
- NASA data query success + latency.
- Achievement unlock velocity.

## 13. Risks & Mitigations

| Risk                                  | Impact           | Mitigation                 |
| ------------------------------------- | ---------------- | -------------------------- |
| API quota / NASA latency              | Slow data panels | Cache + fallback           |
| Mobile performance on low-end devices | Drop-off         | Progressive feature gating |
| Unsecured keys                        | Data exposure    | Env var + edge proxy       |
| Complex simulation logic coupling UI  | Hard to port     | Extract pure logic modules |

## 14. Immediate Action Items

- [ ] Remove hardcoded Supabase anon key from repo & rotate key.
- [ ] Add `.env.example` for web + mobile.
- [ ] Create `shared/` folder for simulation constants.
- [ ] Add test harness for NASA function mocking.
- [ ] Implement code generation script for Supabase types sync.

---

Prepared to complement a more user-friendly README. See `README.md` for onboarding details.
