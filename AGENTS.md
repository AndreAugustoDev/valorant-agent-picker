# AGENTS.md

## Project Overview

Valorant Spin Wheel — a high-performance Svelte 5 + Vite single-page application (SPA) that lets users spin an animated wheel to randomly pick a Valorant agent. Features custom Web Audio sound synthesis, GPU image pre-caching, dynamic native endonym localization, and cryptographic selection.

## Tech Stack

- **Svelte 5** — UI framework with native runes (`$state`, `$derived`, `$derived.by`, `$props`, `$effect`)
- **Vite 8** — Next-generation frontend tooling and build pipeline
- **Tailwind CSS v4** — Utility-first styling via `@tailwindcss/vite`
- **TypeScript** — Strongly typed domain entities, API adapters, and component contracts
- **intlayer** + `svelte-intlayer` + `vite-intlayer` — Client-side internationalization with `no-prefix` URL routing
- **@valpro-labs/valorant-api** — Valorant agent data source
- **Web Audio API** — Synthesized physical wheel tick and victory fanfare without external audio files
- **Package Manager**: Bun

## Commands

```bash
bun install      # Install project dependencies
bun dev          # Start local dev server at localhost:5173
bun build        # Build production bundle to ./dist/
bun preview      # Preview production build locally
bun lint         # Run oxlint for code correctness
bun lint:fix     # Automatically fix lint issues
bun fmt          # Format codebase using oxfmt
bun fmt:check    # Verify code formatting
```

## Linting & Formatting

- **oxlint** — Configured in `.oxlintrc.json` (TypeScript, import, unicorn plugins; correctness=error)
- **oxfmt** — Configured in `.oxfmtrc.json`

## Project Structure

```text
valorant-agent-picker/
├── index.html                  # Single-page entry HTML
├── intlayer.config.ts          # Intlayer configuration (no-prefix mode)
├── package.json                # Project dependencies and scripts
├── svelte.config.js            # Svelte compiler configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration (Svelte, Tailwind, Intlayer)
├── public/
│   └── favicon.svg             # App favicon
└── src/
    ├── App.svelte              # Main application shell and header
    ├── main.ts                 # Svelte 5 app bootstrap (mount)
    ├── components/
    │   ├── index.ts            # Components barrel export
    │   ├── LanguagePicker/
    │   │   ├── index.ts
    │   │   └── LanguagePicker.svelte
    │   └── SpinWheel/
    │       ├── index.ts
    │       ├── SpinWheel.content.ts
    │       └── SpinWheel.svelte
    ├── lib/
    │   ├── api/
    │   │   └── agents.ts       # Valorant API integration
    │   └── core/
    │       ├── audio.ts        # Web Audio API sound synthesis
    │       ├── cache.ts        # Image pre-caching & GPU decoding
    │       ├── locales.ts      # Native endonyms & Unicode flag generation
    │       └── valorant.ts     # Domain logic, color handling & cryptographic selection
    └── styles/
        └── global.css          # Tailwind CSS global styles
```

## Data Flow

1. `src/main.ts` mounts `App.svelte` to the root DOM container.
2. `getInitialLocale()` synchronously detects the user locale (`localStorage` ➔ `navigator.language` ➔ `DEFAULT_VALORANT_LOCALE`) to prevent language flashing.
3. `loadData()` fetches agents from Valorant API (`@valpro-labs/valorant-api`).
4. `agentAdapter()` sanitizes API data into the normalized `Agent` domain model.
5. `preloadAgentAssets()` preloads and decodes (`img.decode()`) all slice icons and winner portraits in parallel.
6. `SpinWheel.svelte` renders the dynamic conic gradient, slice icons, synchronized quartic deceleration ticks, and the central winner portrait.

## Key Patterns & Architecture

### Svelte 5 Runes

State management is handled using modern Svelte 5 runes:

```svelte
let { agents = [], isLocaleLoading = false } = $props<{ agents: Agent[]; isLocaleLoading?: boolean }>();
let selectedRoles = $state<Set<Role>>(new Set());
let availableAgents = $derived(filterAgents(agents, selectedRoles));
let sliceAngle = $derived(availableAgents.length > 0 ? 360 / availableAgents.length : 360);
```

### Intlayer Client-Side i18n (`no-prefix`)

- Configured with `mode: "no-prefix"` to keep clean root URLs without locale path redirects.
- Components subscribe to dictionary stores reactively via `$content`:

```svelte
<script lang="ts">
  import { useIntlayer, useLocale } from "svelte-intlayer";
  const content = useIntlayer("spinwheel");
  const { setLocale } = useLocale();
</script>

<span>{$content.wheel.idle}</span>
```

### Cryptographic Randomness & Duplicate Prevention

Random selection relies on `crypto.getRandomValues()` to eliminate pseudo-random bias. Consecutive repeats are excluded when more than one candidate is active:

```typescript
export function pickRandomAgent(
  items: Agent[],
  lastWinnerId?: string | null,
): { winner: Agent; index: number } | null {
  if (!items || items.length === 0) return null;

  const pool =
    lastWinnerId && items.length > 1 ? items.filter((agent) => agent.id !== lastWinnerId) : items;

  const randomIndex = Math.floor(getCryptoRandom() * pool.length) % pool.length;
  const winner = pool[randomIndex];
  const realIndex = items.findIndex((agent) => agent.id === winner.id);

  return { winner, index: realIndex };
}
```

### Synthesized Web Audio API (`src/lib/core/audio.ts`)

- **Tick SFX**: Physical wooden peg sound generated on the fly via `AudioContext` triangle oscillators. Pitch scales with angular velocity and cadence is throttled (minimum 55ms) to prevent audio buzzing at high speeds.
- **Victory Chime**: Harmonic chord fanfare played upon revealing the selected winner.
- **Audio State**: Persisted in `localStorage` (`valorant_wheel_sound_muted`).

### Asset Pre-Caching (`src/lib/core/cache.ts`)

- Collects all slice icons (`displayIcon`) and splash portraits (`fullPortrait`).
- Calls `img.decode()` asynchronously to transfer rasterized images directly to the GPU prior to rendering.
- Uses `Promise.allSettled` to prevent network timeouts from interrupting app initialization.

### Dynamic Localization & Regional Flags (`src/lib/core/locales.ts`)

- Autonyms and region names are resolved dynamically via native `Intl.DisplayNames` and `Intl.Locale` without hardcoded translation tables.
- Country codes are converted into Unicode regional indicator symbols (flag emojis) dynamically via code point arithmetic.

## Domain Types (`src/lib/core/valorant.ts`)

```typescript
import type { AgentResponse } from "@valpro-labs/valorant-api";

export type Role = AgentResponse["role"]["displayName"];

export interface Agent {
  id: string;
  name: string;
  role: Role;
  icon: string;
  image: string;
  portrait: string;
  color: string;
}

export interface LanguageOption {
  code: ValorantLocale;
  name: string;
  flag: string;
}
```
