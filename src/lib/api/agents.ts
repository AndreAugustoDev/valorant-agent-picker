import { type AgentResponse, ValorantApi, type ValorantLocale } from "@valpro-labs/valorant-api";
import { DEFAULT_VALORANT_LOCALE } from "../core/locales";
import { type Agent, agentAdapter } from "../core/valorant";

export const getAgents = async (language: ValorantLocale = DEFAULT_VALORANT_LOCALE) => {
  const api = new ValorantApi({ language });
  const response: AgentResponse[] = await api.agentsEndpoints.getAgentsV1();

  const agents: Agent[] = response
    .map(agentAdapter)
    .filter((a): a is Agent => a !== null)
    .sort((a, b) => a.name.localeCompare(b.name, language));

  return agents;
};
