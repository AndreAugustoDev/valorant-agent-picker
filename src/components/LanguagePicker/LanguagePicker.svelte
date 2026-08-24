<script lang="ts">
  import { VALORANT_LANGUAGES } from "../../lib/core/locales";
  import type { ValorantLocale } from "@valpro-labs/valorant-api";

  let { currentLocale, onLocaleChange } = $props<{
    currentLocale: ValorantLocale;
    onLocaleChange: (locale: ValorantLocale) => void;
  }>();

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    onLocaleChange(target.value as ValorantLocale);
  }
</script>

<div class="language-picker">
  <select value={currentLocale} onchange={handleChange} aria-label="Selecionar idioma">
    {#each VALORANT_LANGUAGES as lang}
      <option value={lang.code}>
        {lang.flag}
        {lang.name}
      </option>
    {/each}
  </select>
</div>

<style>
  .language-picker {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  select {
    padding: 0.55rem 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    background: rgba(15, 25, 35, 0.85);
    backdrop-filter: blur(8px);
    color: #ece8e1;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease;
  }

  select:hover,
  select:focus {
    border-color: #ff4655;
  }
</style>
