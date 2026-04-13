// --- Domain Types (Clean) ---
export type Role = 'Duelista' | 'Controlador' | 'Sentinela' | 'Iniciador';

export interface Agent {
  id: string;
  name: string;
  role: Role;
  imgUrl: string;
  color: string;
}

// --- Raw API Types (Dirty/External) ---
export interface RawAgent {
  uuid: string;
  displayName: string;
  isPlayableCharacter: boolean;
  role?: {
    displayName: string;
  };
  fullPortrait?: string;
  displayIcon?: string;
  backgroundGradientColors: string[];
}

// Wrapper da resposta oficial da API
export interface ValorantApiResponse {
  status: number;
  data: RawAgent[];
}

// --- Logic: Adapter / Mapper ---
export function mapRawAgentToDomain(raw: RawAgent): Agent | null {
  // Fail Fast: Proteção dupla (caso a API mude ou o filtro de URL falhe)
  if (!raw.isPlayableCharacter || !raw.role) {
    return null;
  }

  // Fallback seguro para cores
  const primaryColor = raw.backgroundGradientColors && raw.backgroundGradientColors.length > 0
    ? `#${raw.backgroundGradientColors[0]}`
    : '#333333';

  return {
    id: raw.uuid,
    name: raw.displayName,
    role: raw.role.displayName as Role,
    imgUrl: raw.fullPortrait || raw.displayIcon || '', 
    color: primaryColor
  };
}

// --- Logic: Domain Operations ---
export function filterAgents(agents: Agent[], activeRoles: Set<Role>): Agent[] {
  if (activeRoles.size === 0) return agents;
  return agents.filter(agent => activeRoles.has(agent.role));
}

export function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}