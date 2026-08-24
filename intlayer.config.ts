import { type IntlayerConfig, Locales } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: [
      //
      Locales.ENGLISH_UNITED_STATES,
      Locales.PORTUGUESE_BRAZIL,
    ],
    defaultLocale: Locales.ENGLISH_UNITED_STATES,
  },
  routing: {
    mode: "no-prefix",
    storage: [
      {
        type: "localStorage",
        name: "user-locale",
      },
    ],
  },
};

export default config;
