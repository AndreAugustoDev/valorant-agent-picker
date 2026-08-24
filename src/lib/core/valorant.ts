import type { AgentResponse } from "@valpro-labs/valorant-api";

export type Role = AgentResponse["role"]["displayName"];

export interface Agent {
  id: string;
  name: string;
  role: Role;
  icon: string;
  image: string;
  portrait: string;
  color: string;
}

export function extractRoles(agents: Agent[]): Role[] {
  if (!agents || agents.length === 0) {
    return [];
  }
  const unique: Role[] = [];
  const seen = new Set<Role>();
  for (const agent of agents) {
    if (agent.role && !seen.has(agent.role)) {
      seen.add(agent.role);
      unique.push(agent.role);
    }
  }
  return unique;
}

/**
 * Resolves the primary agent color using the first palette entry or a fallback
 */
export function getAgentColor(colors?: string[] | null, fallbackColor = "#ff4655"): string {
  const primary = colors?.[0];
  if (!primary) {
    return fallbackColor;
  }

  return primary.startsWith("#") ? primary : `#${primary}`;
}

/**
 * Filter agent API response with only needed keys
 */
export function agentAdapter(agent: AgentResponse): Agent | null {
  if (!agent.isPlayableCharacter || !agent.role) {
    return null;
  }

  // Head icon url (square face icon)
  const iconUrl = agent.displayIcon || agent.displayIconSmall || agent.fullPortrait || "";
  // Full splash art url for winner display
  const portraitUrl = agent.fullPortrait || agent.bustPortrait || agent.displayIcon || "";

  return {
    id: agent.uuid,
    name: agent.displayName,
    role: agent.role.displayName,
    icon: iconUrl,
    image: iconUrl,
    portrait: portraitUrl,
    color: getAgentColor(agent.backgroundGradientColors),
  };
}

// Filter agents by role
export function filterAgents(agents: Agent[], activeRoles: Set<Role>): Agent[] {
  if (!agents || agents.length === 0) {
    return [];
  }
  if (!activeRoles || activeRoles.size === 0) {
    return agents;
  }
  return agents.filter((agent) => activeRoles.has(agent.role));
}

/**
 * Return a random float number [0, 1) with crypto security
 */
export function getCryptoRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

/**
 * Picks an agent using cryptographic entropy, strictly preventing consecutive repeats
 */
export function pickRandomAgent(
  items: Agent[],
  lastWinnerId?: string | null,
): { winner: Agent; index: number } | null {
  if (!items || items.length === 0) {
    return null;
  }

  // Prevent consecutive duplicates whenever more than one candidate exists
  const pool =
    lastWinnerId && items.length > 1 ? items.filter((agent) => agent.id !== lastWinnerId) : items;

  const randomIndex = Math.floor(getCryptoRandom() * pool.length);
  const winner = pool[randomIndex];
  const realIndex = items.findIndex((agent) => agent.id === winner.id);

  return { winner, index: realIndex };
}
