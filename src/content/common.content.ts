import { type Dictionary, t } from "intlayer";

const commonContent = {
  key: "common",
  content: {
    title: t({
      "en-US": "VALORANT AGENT PICKER",
      "pt-BR": "SELETOR DE AGENTES VALORANT",
    }),
    boot: {
      loading: t({
        "en-US": "Loading language and wheel images.",
        "pt-BR": "Carregando idioma e imagens da roleta.",
      }),
    },
    audio: {
      mute: t({
        "en-US": "Mute sound",
        "pt-BR": "Silenciar som",
      }),
      unmute: t({
        "en-US": "Enable sound",
        "pt-BR": "Ativar som",
      }),
    },
  },
} satisfies Dictionary;

export default commonContent;
