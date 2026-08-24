import type { ValorantLocale } from "@valpro-labs/valorant-api";

export const DEFAULT_VALORANT_LOCALE: ValorantLocale = "en-US";
export const VALORANT_LOCALE_STORAGE_KEY = "valorant_locale";
export const VALORANT_LOCALE_EVENT = "valorant-locale-change";

export interface LanguageOption {
  code: ValorantLocale;
  name: string;
  flag: string;
}

export const VALORANT_LOCALE_CODES: ValorantLocale[] = [
  "en-US",
  "pt-BR",
  "es-ES",
  "es-MX",
  "de-DE",
  "fr-FR",
  "it-IT",
  "pl-PL",
  "ru-RU",
  "tr-TR",
  "ja-JP",
  "ko-KR",
  "zh-CN",
  "zh-TW",
  "vi-VN",
  "th-TH",
  "id-ID",
  "ar-AE",
];

/**
 * Converts a 2-letter ISO country code into its corresponding Unicode flag emoji
 */
function getCountryFlag(regionCode?: string): string {
  if (!regionCode || regionCode.length !== 2) {
    return "🌐";
  }

  // Offset to map ASCII letters to Regional Indicator Symbols (U+1F1E6 to U+1F1FF)
  const codePoints = [...regionCode.toUpperCase()].map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

/**
 * Automatically formats the locale into a standardized native endonym (e.g., "English (US)")
 */
function formatStandardLocaleName(localeCode: ValorantLocale): string {
  try {
    const parsed = new Intl.Locale(localeCode);
    const lang = parsed.language;
    const region = parsed.region;
    const script = parsed.script;

    // Use the target locale itself to fetch the autonym (native tongue name)
    const langFormatter = new Intl.DisplayNames([localeCode], { type: "language" });
    const regionFormatter = new Intl.DisplayNames([localeCode], { type: "region" });

    // Handle scripts (e.g., zh-Hans vs zh-Hant)
    const langKey = script ? `${lang}-${script}` : lang;
    const rawLangName = langFormatter.of(langKey) ?? lang;
    const capitalizedLang = rawLangName.charAt(0).toUpperCase() + rawLangName.slice(1);

    if (!region || script) {
      return capitalizedLang;
    }

    // Single-market languages don't need redundant region disambiguation (e.g., "Deutsch" vs "Deutsch (Deutschland)")
    const singleRegionDefaults = [
      "DE",
      "FR",
      "IT",
      "PL",
      "RU",
      "TR",
      "JA",
      "KR",
      "TH",
      "VN",
      "ID",
      "AE",
      "JP",
    ];
    if (singleRegionDefaults.includes(region)) {
      return capitalizedLang;
    }

    // Keep short international regional qualifiers
    const regionName = region === "US" ? "US" : (regionFormatter.of(region) ?? region);
    return `${capitalizedLang} (${regionName})`;
  } catch {
    return localeCode;
  }
}

export function isValorantLocale(value: string): value is ValorantLocale {
  return VALORANT_LOCALE_CODES.includes(value as ValorantLocale);
}

/**
 * Resolves the startup locale synchronously using stored preference, browser language, or default fallback
 */
export function getInitialLocale(): ValorantLocale {
  if (typeof window === "undefined") {
    return DEFAULT_VALORANT_LOCALE;
  }

  // Check existing user preference in localStorage
  const saved = localStorage.getItem(VALORANT_LOCALE_STORAGE_KEY);
  if (saved && isValorantLocale(saved)) {
    return saved;
  }

  // Check direct browser language match
  const browserLang = navigator.language;
  if (isValorantLocale(browserLang)) {
    return browserLang;
  }

  // Match language prefix (e.g. "pt" -> "pt-BR", "es" -> "es-ES")
  const prefix = browserLang.split("-")[0];
  const matched = VALORANT_LOCALE_CODES.find((code) => code.startsWith(prefix));

  return matched ?? DEFAULT_VALORANT_LOCALE;
}

// Generate complete language options dynamically at runtime
export const VALORANT_LANGUAGES: LanguageOption[] = VALORANT_LOCALE_CODES.map((code) => {
  const parsed = new Intl.Locale(code);
  return {
    code,
    name: formatStandardLocaleName(code),
    flag: getCountryFlag(parsed.region),
  };
});
