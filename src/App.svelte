<script lang="ts">
  import { DEFAULT_VALORANT_LOCALE, VALORANT_LOCALE_STORAGE_KEY, getInitialLocale, isValorantLocale } from "./lib/core/locales";
  import { useIntlayer, useLocale } from "svelte-intlayer";
  import type { Agent } from "./lib/core/valorant";
  import LanguageDropdown from "./components/LanguagePicker/LanguagePicker.svelte";
  import { SpinWheel } from "./components";
  import type { ValorantLocale } from "@valpro-labs/valorant-api";
  import { getAgents } from "./lib/api/agents";
  import { onMount } from "svelte";
  import { preloadAgentAssets } from "./lib/core/media-cache";
  import { sfx } from "./lib/core/audio";

  const SOUND_STORAGE_KEY = "valorant_wheel_sound_muted";

  const content = useIntlayer("common");
  const { setLocale } = useLocale();

  const initialLocale = getInitialLocale();
  setLocale(initialLocale);

  let activeLocale = $state<ValorantLocale>(initialLocale);
  let agents = $state<Agent[]>([]);
  let isLoading = $state(true);
  let isMuted = $state(false);

  async function loadData(locale: ValorantLocale) {
    isLoading = true;
    try {
      setLocale(locale);
      const data = await getAgents(locale);

      // Pre-cache all icons and portraits before rendering the wheel
      await preloadAgentAssets(data);

      agents = data;
      activeLocale = locale;
      localStorage.setItem(VALORANT_LOCALE_STORAGE_KEY, locale);
    } catch (err) {
      console.error("Failed to load agents:", err);
    } finally {
      isLoading = false;
    }
  }

  function handleLocaleChange(newLocale: ValorantLocale) {
    if (newLocale === activeLocale) {
      return;
    }
    void loadData(newLocale);
  }

  function toggleSound() {
    isMuted = !isMuted;
    sfx.setMuted(isMuted);
    localStorage.setItem(SOUND_STORAGE_KEY, String(isMuted));
  }

  onMount(() => {
    // Load audio mute state
    const savedSound = localStorage.getItem(SOUND_STORAGE_KEY);
    if (savedSound !== null) {
      const muted = savedSound === "true";
      isMuted = muted;
      sfx.setMuted(muted);
    }

    // Load initial locale data
    const savedLocale = localStorage.getItem(VALORANT_LOCALE_STORAGE_KEY);
    const initialLocale = savedLocale && isValorantLocale(savedLocale) ? savedLocale : DEFAULT_VALORANT_LOCALE;
    void loadData(initialLocale);
  });
</script>

<div class="app-layout">
  <header class="app-header">
    <div class="header-left">
      <img src="favicon.svg" alt="valorant logo" class="valorant-logo" />
    </div>

    <div class="header-center">
      <h1 class="app-title">{$content.title}</h1>
      <div class="title-bar"></div>
    </div>

    <div class="header-right">
      <button
        class="sound-btn"
        class:muted={isMuted}
        onclick={toggleSound}
        aria-label={isMuted ? $content.audio.unmute : $content.audio.mute}
        title={isMuted ? $content.audio.unmute : $content.audio.mute}
      >
        {#if isMuted}
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        {:else}
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        {/if}
      </button>

      <LanguageDropdown currentLocale={activeLocale} onLocaleChange={handleLocaleChange} />
    </div>
  </header>

  <main class="app-main">
    {#if isLoading && agents.length === 0}
      <div class="loader-container">
        <div class="boot-spinner"></div>
      </div>
    {:else}
      <SpinWheel {agents} isLocaleLoading={isLoading} />
    {/if}
  </main>
</div>

<style>
  :global(body) {
    background: #0f1923;
    color: white;
    font-family: sans-serif;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .app-header {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 1.2rem 2rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    box-sizing: border-box;
  }

  .header-left {
    display: flex;
    align-items: center;
  }

  .valorant-logo {
    width: 32px;
    height: 32px;
    color: #ff4655;
    transition: transform 0.2s ease;
  }

  .valorant-logo:hover {
    transform: scale(1.08);
  }

  .header-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .app-title {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 900;
    letter-spacing: 2px;
    color: #ece8e1;
    text-transform: uppercase;
  }

  .title-bar {
    width: 60px;
    height: 4px;
    background: #ff4655;
    margin-top: 0.4rem;
    border-radius: 2px;
  }

  .header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
  }

  .sound-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 25, 35, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #ece8e1;
    padding: 0.55rem;
    border-radius: 4px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
  }

  .sound-btn:hover {
    border-color: #ff4655;
    color: #ff4655;
  }

  .sound-btn.muted {
    color: #666;
    border-color: rgba(255, 255, 255, 0.08);
  }

  .app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1.5rem 1rem 2.5rem;
    box-sizing: border-box;
    width: 100%;
  }

  .loader-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
  }

  .boot-spinner {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #ff4655;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .app-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .header-left {
      display: none;
    }

    .header-right {
      width: 100%;
      justify-content: center;
    }

    .app-title {
      font-size: 1.3rem;
    }
  }
</style>
