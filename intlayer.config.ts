import { type IntlayerConfig, Locales } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: [
      //
      Locales.ENGLISH,
      Locales.PORTUGUESE_BRAZIL,
    ],
    defaultLocale: Locales.ENGLISH,
  },
};

export default config;
