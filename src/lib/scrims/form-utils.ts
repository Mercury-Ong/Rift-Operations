import { PlayerRole } from "@/lib/models";

export const SCRIM_PICK_COUNT = 5;
export const SCRIM_ROLE_ORDER: PlayerRole[] = [
  "TOP",
  "JUNGLE",
  "MID",
  "ADC",
  "SUPPORT",
];
export const SCRIM_ROLE_LABELS: Record<PlayerRole, string> = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MID: "Mid",
  ADC: "AD carry",
  SUPPORT: "Support",
};

export function createEmptyPicks(): string[] {
  return Array.from({ length: SCRIM_PICK_COUNT }, () => "");
}

export interface ParsedKillScore {
  blueKills: number;
  redKills: number;
}

export function parseKillScore(value: string): ParsedKillScore | null {
  const match = value.match(/^\s*(\d+)\s*:\s*(\d+)\s*$/);
  if (!match) {
    return null;
  }

  return {
    blueKills: Number(match[1]),
    redKills: Number(match[2]),
  };
}

export function arePicksComplete(
  bluePicks: string[],
  redPicks: string[],
): boolean {
  return !bluePicks.some((pick) => !pick) && !redPicks.some((pick) => !pick);
}

export function arePicksUnique(
  bluePicks: string[],
  redPicks: string[],
): boolean {
  const allSelectedPicks = [...bluePicks, ...redPicks];
  return new Set(allSelectedPicks).size === allSelectedPicks.length;
}
