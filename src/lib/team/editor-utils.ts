import { ChampionPoolEntry, Player } from "@/lib/models";
import {
  ChampionOption,
  PlayerEditor,
  PoolEditorEntry,
} from "@/lib/team/editor-types";

export function normalizeId(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function nextPlayerId(name: string, existingIds: Set<string>): string {
  const base = `p-${normalizeId(name) || "player"}`;
  if (!existingIds.has(base)) {
    return base;
  }

  let index = 2;
  while (existingIds.has(`${base}-${index}`)) {
    index += 1;
  }

  return `${base}-${index}`;
}

export function clampComfort(value: number): number {
  if (Number.isNaN(value)) {
    return 1;
  }

  return Math.max(1, Math.min(10, Math.round(value)));
}

export function editorFromPlayer(
  player: Player,
  championPool: ChampionPoolEntry[],
): PlayerEditor {
  return {
    id: player.id,
    isNew: false,
    summonerName: player.summonerName,
    role: player.role,
    pool: championPool
      .filter((entry) => entry.playerId === player.id)
      .map((entry, index) => ({
        key: `${player.id}-${entry.championId}-${index}`,
        championId: entry.championId,
        comfort: clampComfort(entry.proficiency),
      })),
  };
}

export function championOptionsForEntry(
  editor: PlayerEditor,
  entryKey: string,
  championOptions: ChampionOption[],
): ChampionOption[] {
  const selectedByOtherEntries = new Set(
    editor.pool
      .filter((entry) => entry.key !== entryKey)
      .map((entry) => entry.championId)
      .filter(Boolean),
  );

  return championOptions.filter(
    (champion) => !selectedByOtherEntries.has(champion.id),
  );
}

export function nextPoolEntry(
  championOptions: ChampionOption[],
  existingPool: PoolEditorEntry[] = [],
): PoolEditorEntry | null {
  const selected = new Set(existingPool.map((entry) => entry.championId));
  const firstAvailable = championOptions.find(
    (champion) => !selected.has(champion.id),
  );

  if (!firstAvailable) {
    return null;
  }

  return {
    key: `pool-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    championId: firstAvailable.id,
    comfort: 5,
  };
}

export function hasDuplicateChampions(pool: PoolEditorEntry[]): boolean {
  const seen = new Set<string>();
  for (const entry of pool) {
    if (!entry.championId) {
      continue;
    }

    if (seen.has(entry.championId)) {
      return true;
    }

    seen.add(entry.championId);
  }

  return false;
}
