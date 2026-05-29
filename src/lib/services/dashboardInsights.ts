import { PlayerRole, TeamDataset } from "@/lib/models";
import { average } from "@/lib/utils/math";

export interface RoleChampionSuggestion {
  role: PlayerRole;
  roleLabel: string;
  player: string;
  primaryChampion: string;
  backupChampion: string;
  confidenceText: string;
}

export interface DashboardInsights {
  suggestedMatches: RoleChampionSuggestion[];
  averageKillDelta: number;
  /** Pre-formatted string e.g. "+2.5" or "-1.0" */
  formattedKillDelta: string;
  /** Tone for MetricCard — positive when delta ≥ 0 */
  killDeltaTone: "positive" | "neutral";
  averageGameDuration: number;
  draftDiversity: number;
}

const ROLE_ORDER: PlayerRole[] = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

const ROLE_LABELS: Record<PlayerRole, string> = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MID: "Mid",
  ADC: "AD carry",
  SUPPORT: "Support",
};

function buildSuggestedMatches(data: TeamDataset): RoleChampionSuggestion[] {
  const championMap = new Map(
    data.champions.map((champion) => [champion.id, champion]),
  );

  // Count champion picks per role slot (index 0=TOP … 4=SUPPORT) from team's side only
  const rolePickCounts: Map<string, number>[] = ROLE_ORDER.map(() => new Map());

  for (const scrim of data.scrims) {
    for (const game of scrim.games) {
      const teamPicks =
        game.side === "BLUE" ? (game.bluePicks ?? []) : (game.redPicks ?? []);
      teamPicks.forEach((championId, roleIdx) => {
        if (championId && roleIdx < ROLE_ORDER.length) {
          const counts = rolePickCounts[roleIdx];
          counts.set(championId, (counts.get(championId) ?? 0) + 1);
        }
      });
    }
  }

  return ROLE_ORDER.map((role, idx) => {
    const rolePlayer = data.players.find((player) => player.role === role);
    const sorted = [...rolePickCounts[idx].entries()].sort(
      (a, b) => b[1] - a[1],
    );

    const primaryEntry = sorted[0];
    const backupEntry = sorted[1];

    const primaryChampion = primaryEntry
      ? (championMap.get(primaryEntry[0])?.name ?? primaryEntry[0])
      : "No data";

    const backupChampion = backupEntry
      ? (championMap.get(backupEntry[0])?.name ?? backupEntry[0])
      : "No backup yet";

    const totalGames = sorted.reduce((sum, [, count]) => sum + count, 0);
    const confidenceText =
      totalGames > 0
        ? `${totalGames} scrim game${totalGames !== 1 ? "s" : ""} tracked`
        : "No scrim picks recorded yet";

    return {
      role,
      roleLabel: ROLE_LABELS[role],
      player: rolePlayer?.summonerName ?? "Unassigned",
      primaryChampion,
      backupChampion,
      confidenceText,
    };
  });
}

export function getDashboardInsightsFromDataset(
  data: TeamDataset,
): DashboardInsights {
  const games = data.scrims.flatMap((scrim) => scrim.games);
  const killDeltas = games.map((game) => game.killsFor - game.killsAgainst);
  const gameDurations = games.map((game) => game.durationMinutes);

  // Draft diversity counts all picks (both sides) for breadth metric
  const allPickIds = games.flatMap((game) => [
    ...(game.bluePicks ?? []),
    ...(game.redPicks ?? []),
  ]);

  const uniquePicks = new Set(allPickIds.filter(Boolean)).size;
  const draftDiversity = allPickIds.length
    ? (uniquePicks / allPickIds.length) * 100
    : 0;

  const averageKillDelta = average(killDeltas);
  const averageGameDuration = average(gameDurations);

  const roundedKillDelta = Number(averageKillDelta.toFixed(1));

  return {
    suggestedMatches: buildSuggestedMatches(data),
    averageKillDelta: roundedKillDelta,
    formattedKillDelta:
      roundedKillDelta >= 0 ? `+${roundedKillDelta}` : String(roundedKillDelta),
    killDeltaTone: roundedKillDelta >= 0 ? "positive" : "neutral",
    averageGameDuration: Number(averageGameDuration.toFixed(1)),
    draftDiversity: Number(draftDiversity.toFixed(1)),
  };
}
