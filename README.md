<div align="center">

# 🎯 VALORANT AGENT PICKER

  **A high-performance, animated spin wheel single-page application to pick your next Valorant agent.**

  [![Svelte 5](https://img.shields.io/badge/Svelte%205-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

  [Live Demo](https://andreaugustodev.github.io/valorant-agent-picker/)

</div>

---

## 🌟 Overview

**Valorant Agent Picker** is an ultra-fast, client-side SPA designed to solve team composition dilemmas and add excitement to agent selection. Built on **Svelte 5 Runes** and **Vite**, it delivers smooth 60fps spin animations, synthesized realistic audio without external assets, GPU image pre-caching, and multi-language support across 18 official Riot Games locales.

---

## ✨ Features

- 🎡 **Dynamic Physics Wheel**: Conic gradient slices rendered on-the-fly with quartic deceleration (`easeOutQuart`) and mechanical pointer impact bounce.
- 🔊 **Synthesized Web Audio API**: Procedurally generated wooden peg clicks with angular velocity pitch scaling and winner fanfare chimes — *0KB external audio files downloaded*.
- ⚡ **GPU Asset Pre-Caching**: Concurrent asset resolution using `img.decode()` and `Promise.allSettled` to eliminate layout shifts and blank frames.
- 🎲 **Cryptographic Randomness**: Selection driven by `crypto.getRandomValues()` with automatic non-consecutive duplicate prevention.
- 🌐 **Zero-Prefix Internationalization**: Client-side i18n powered by **Intlayer**, featuring native endonyms (e.g. *English (US)*, *Português (Brasil)*) and dynamic Unicode flag generation without URL redirects.
- 🛡️ **Role Filtering**: Instantly isolate Duelists, Initiators, Controllers, or Sentinels.
- 🎨 **Valorant Aesthetic**: Tactical dark palette (`#0f1923`), neon red accents (`#ff4655`), and dynamic winner glowing hubs.
- 🚀 **Automated CI/CD**: Seamless zero-config deployments to **GitHub Pages** via GitHub Actions.

---

## 🛠️ Tech Stack

| Category                      | Technology                                                                                |
| :---------------------------- | :---------------------------------------------------------------------------------------- |
| **Core Framework**            | [Svelte 5](https://svelte.dev/) (Native Runes: `$state`, `$derived`, `$props`, `$effect`) |
| **Bundler & Dev Server**      | [Vite](https://vitejs.dev/)                                                               |
| **Styling**                   | [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`                       |
| **Language**                  | [TypeScript](https://www.typescriptlang.org/) (Strict Mode)                               |
| **Localization (i18n)**       | [Intlayer](https://intlayer.org/) (`svelte-intlayer`, `vite-intlayer`)                    |
| **Data Provider**             | [@valpro-labs/valorant-api](https://github.com/valpro-labs/valorant-api)                  |
| **Runtime & Package Manager** | [Bun](https://bun.sh/)                                                                    |
| **Linting & Formatting**      | [oxlint](https://oxc.rs/) & [oxfmt](https://oxc.rs/)                                      |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed (v1.0 or higher recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/valorant-agent-picker.git

# Navigate to project directory
cd valorant-agent-picker

# Install dependencies with Bun
bun install
```

### Development

```bash
# Start local development server
bun dev
```

Visit `http://localhost:5173/` in your browser.

### Production Build

```bash
# Build optimized production bundle
bun run build

# Preview production build locally
bun run preview
```

---

## 📂 Project Structure

```text
valorant-agent-picker/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment pipeline
├── public/
│   └── favicon.svg             # Application icon
├── src/
│   ├── components/
│   │   ├── LanguagePicker/     # Standardized language selector
│   │   │   ├── LanguagePicker.svelte
│   │   │   └── index.ts
│   │   ├── SpinWheel/          # Core interactive wheel component
│   │   │   ├── SpinWheel.content.ts
│   │   │   ├── SpinWheel.svelte
│   │   │   └── index.ts
│   │   └── index.ts            # Components barrel export
│   ├── lib/
│   │   ├── api/
│   │   │   └── agents.ts       # Valorant API client integration
│   │   └── core/
│   │       ├── audio.ts        # Synthesized Web Audio engine
│   │       ├── cache.ts        # Image pre-caching & GPU decoding
│   │       ├── locales.ts      # Native endonyms & Unicode flag generator
│   │       └── valorant.ts     # Domain model & cryptographic picker
│   ├── styles/
│   │   └── global.css          # Tailwind CSS v4 directives
│   ├── App.svelte              # Root shell layout & state orchestrator
│   └── main.ts                 # Svelte 5 application mount
├── index.html                  # Single-page entry document
├── intlayer.config.ts          # Intlayer configuration (no-prefix mode)
├── package.json
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🧠 Architecture Highlights

### 1. Synchronous Locale Resolution (Zero Language Flash)

Instead of waiting for asynchronous mount lifecycles, the initial locale is resolved synchronously prior to the first render pass:

$$\text{Locale Priority} = \text{localStorage} \longrightarrow \text{navigator.language} \longrightarrow \text{en-US}$$

### 2. Cryptographic Selection & Duplicate Prevention

Randomness is drawn from `crypto.getRandomValues()` instead of `Math.random()`, with guaranteed non-consecutive results whenever multiple candidates are available.

```typescript
export function pickRandomAgent(
  items: Agent[],
  lastWinnerId?: string | null
): { winner: Agent; index: number } | null {
  if (!items || items.length === 0) return null;

  const pool =
    lastWinnerId && items.length > 1
      ? items.filter((agent) => agent.id !== lastWinnerId)
      : items;

  const randomIndex = Math.floor(getCryptoRandom() * pool.length) % pool.length;
  return { winner: pool[randomIndex], index: items.findIndex((a) => a.id === pool[randomIndex].id) };
}
```

### 3. Procedural Audio Engine

Audio effects use pure math and oscillators via the **Web Audio API**:

- **Peg Ticks**: Triangle wave pulses ($340\text{Hz} \to 70\text{Hz}$) with throttled cadence ($55\text{ms}$ min interval) to prevent acoustic distortion at peak spin speeds.
- **Victory Chime**: Harmonic 4-note chord cascade ($C_5, E_5, G_5, C_6$).

---

## 📜 Available Scripts

| Command             | Description                                         |
| :------------------ | :-------------------------------------------------- |
| `bun dev`           | Starts local development server at `localhost:5173` |
| `bun run build`     | Compiles production assets into `./dist/`           |
| `bun run preview`   | Serves local production build for testing           |
| `bun run lint`      | Runs `oxlint` for static code correctness           |
| `bun run lint:fix`  | Automatically fixes autofixable lint rules          |
| `bun run fmt`       | Formats codebase using `oxfmt`                      |
| `bun run fmt:check` | Checks code formatting without modifying files      |

---

## 📄 License

**MIT License**. See `LICENSE` for more information.

## ⚠️ Disclaimer

> *Valorant Agent Picker isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.*

---

<div align="center">
  <sub>Built with ❤️ using Svelte 5 & Vite</sub>
</div>
