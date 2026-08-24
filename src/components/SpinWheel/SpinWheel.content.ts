import { type Dictionary, t } from "intlayer";

const SpinWheelContent = {
  key: "SpinWheel",
  content: {
    switchLocale: t({
      "en-US": "Switch locale",
      "pt-BR": "Trocar idioma",
    }),

    wheel: {
      spinning: t({
        "en-US": "SPINNING",
        "pt-BR": "GIRANDO",
      }),
      idle: t({
        "en-US": "READY",
        "pt-BR": "PRONTO",
      }),
    },
    action: {
      spin: t({
        "en-US": "Spin",
        "pt-BR": "Girar",
      }),
      spinAgain: t({
        "en-US": "Spin again",
        "pt-BR": "Girar novamente",
      }),
    },
    loader: {
      spin: t({
        "en-US": "Loading...",
        "pt-BR": "Carregando...",
      }),
    },
  },
} satisfies Dictionary;

export default SpinWheelContent;
