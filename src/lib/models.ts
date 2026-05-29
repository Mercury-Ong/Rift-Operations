export type PlayerRole = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";

export interface Player {
  id: string;
  summonerName: string;
  role: PlayerRole;
  rank: string;
  region: string;
}

export type ChampionClass =
  | "FIGHTER"
  | "TANK"
  | "ASSASSIN"
  | "MAGE"
  | "MARKSMAN"
  | "SUPPORT";

export interface Champion {
  id: string;
  name: string;
  laneTags: PlayerRole[];
  championClass: ChampionClass;
  comfortScore: number;
}

export interface ChampionPoolEntry {
  playerId: string;
  championId: string;
  proficiency: number;
  games: number;
}

export interface TeamSynergy {
  id: string;
  championAId: string;
  championBId: string;
  lanePair: `${PlayerRole}+${PlayerRole}`;
  sampleGames: number;
  winRate: number;
}

export type ScrimOutcome = "WIN" | "LOSS";
export type Side = "BLUE" | "RED";

export interface ScrimGame {
  game: number;
  side: Side;
  durationMinutes: number;
  killsFor: number;
  killsAgainst: number;
  objectiveControl?: number;
  bluePicks?: string[];
  redPicks?: string[];
}

export interface ScrimBlock {
  id: string;
  date: string;
  opponent: string;
  patch?: string;
  format?: "BO3" | "BO5";
  result: ScrimOutcome;
  notes: string;
  games: ScrimGame[];
}

export interface TeamDataset {
  players: Player[];
  champions: Champion[];
  championPool: ChampionPoolEntry[];
  synergies: TeamSynergy[];
  scrims: ScrimBlock[];
}
