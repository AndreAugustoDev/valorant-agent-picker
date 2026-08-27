import { defineConfig } from "vite";
import { intlayer } from "vite-intlayer";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/valorant-agent-picker/",
  plugins: [svelte(), intlayer(), tailwindcss()],
});
