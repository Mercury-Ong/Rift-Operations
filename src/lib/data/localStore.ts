import { seedData } from "@/lib/data/seed";
import { leagueChampions } from "@/lib/data/leagueChampions";
import { TeamDataset } from "@/lib/models";

const STORAGE_KEY = "lol-team-tracker-dataset";

export function isTeamDataset(value: unknown): value is TeamDataset {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    Array.isArray(candidate.players) &&
    Array.isArray(candidate.champions) &&
    Array.isArray(candidate.championPool) &&
    Array.isArray(candidate.synergies) &&
    Array.isArray(candidate.scrims)
  );
}

export function loadLocalDataset(): TeamDataset {
  if (typeof window === "undefined") {
    return structuredClone(seedData);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return structuredClone(seedData);
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isTeamDataset(parsed)) {
      if (parsed.champions.length) {
        return parsed;
      }

      return {
        ...parsed,
        champions: leagueChampions,
      };
    }
  } catch {
    return structuredClone(seedData);
  }

  return structuredClone(seedData);
}

export function saveLocalDataset(dataset: TeamDataset): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
}

export function clearLocalDataset(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function getDatasetStorageKey(): string {
  return STORAGE_KEY;
}
