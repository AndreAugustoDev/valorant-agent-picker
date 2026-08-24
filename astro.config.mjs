// @ts-check
import { defineConfig } from "astro/config";

import { intlayer } from "astro-intlayer";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [svelte(), intlayer()],
});
