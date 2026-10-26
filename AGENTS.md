# AGENTS.md

Single-page 3D Solar System visualization built with React Three Fiber (R3F) + Vite + TypeScript. No tests, no lint, no CI in this repo.

## Commands

- `npm install` — install deps
- `npm run dev` — Vite dev server on port 3000, bound to `0.0.0.0`
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built bundle

No `typecheck`/`lint`/`test` scripts are defined. To typecheck manually: `npx tsc --noEmit` (tsconfig already sets `noEmit`). Do not assume a test runner exists.

## Architecture

- Entrypoint: `index.html` → `/index.tsx` → `App.tsx`. The 3D scene lives in `components/SolarSystem.tsx`, rendered inside a R3F `<Canvas>`; DOM overlays (header, info card, mobile/desktop "Astros" menu) are siblings of the canvas in `App.tsx`.
- All celestial body data is in `constants.ts` (`PLANET_DATA`); the Sun is `PLANET_DATA[0]`, planets follow. Domain types (`CelestialInfo`, `BodyType`) are in `types.ts`.
- Components in `components/` are R3F scene objects (`Sun`, `Planet`, `OrbitPath`, `StarField`, `SystemZone`, `AsteroidBelt`) except `UIOverlay.tsx` (DOM) and `SolarSystem.tsx` (orchestrator).
- Orbit animation is driven by `useFrame` in the internal `TimeSync` component (SolarSystem.tsx), not by per-planet animation loops. Planet/moon positions are tracked in refs and frozen via `frozenPositions` when a body is selected. Camera focus uses GSAP tweens in `CameraController`. When editing orbital behavior, change `TimeSync` + the refs there, not the `Planet` component.

## Environment

- `vite.config.ts` injects `process.env.API_KEY` / `process.env.GEMINI_API_KEY` from `.env.local`'s `GEMINI_API_KEY`. **These are vestigial** — no app code imports or reads an API key. Do not assume Gemini/AI integration exists; the README step about `GEMINI_API_KEY` is stale. New work should not add env usage unless reintroducing that feature.

## Toolchain quirks

- `index.html` contains an `<script type="importmap">` pointing at `esm.sh` for React/three/gsap/`@react-three/*`. Vite still bundles from `node_modules`; the importmap is a leftover from the AI Studio export environment. Prefer the npm-installed packages in `package.json` (don't add new deps via esm.sh).
- Styling: Tailwind loaded via CDN `<script>` in `index.html`, plus a small inline `<style>` for full-screen reset. There is no `tailwind.config.js` / PostCSS pipeline — utility classes work but custom theme config won't.
- TS path alias `@/*` → repo root (configured in `tsconfig.json` and `vite.config.ts`), but actual source files use relative imports (e.g. `'./components/SolarSystem'`, `'../types'`). Follow the relative-import convention when editing existing files.
- `tsconfig.json` sets `experimentalDecorators: true` and `useDefineForClassFields: false`; `target`/`lib` are ES2022. `allowJs` and `allowImportingTsExtensions` are on, so `.ts`/`.tsx` extensions are valid in relative imports.