import { TeamDataset } from "@/lib/models";
import { teamRepository } from "@/lib/repositories/teamRepository";
import { average } from "@/lib/utils/math";

export function getTeamSnapshot() {
  return getTeamSnapshotFromDataset(teamRepository.getDataset());
}

export function getTeamSnapshotFromDataset(data: TeamDataset) {
  const wins = data.scrims.filter((scrim) => scrim.result === "WIN").length;
  const winRate = data.scrims.length ? (wins / data.scrims.length) * 100 : 0;

  const championMap = new Map(
    data.champions.map((champion) => [champion.id, champion]),
  );

  // Count picks from team's side only (bluePicks when side=BLUE, redPicks when side=RED)
  const pickCounts = new Map<string, number>();
  for (const scrim of data.scrims) {
    for (const game of scrim.games) {
      const teamPicks =
        game.side === "BLUE" ? (game.bluePicks ?? []) : (game.redPicks ?? []);
      for (const pickId of teamPicks) {
        if (pickId) {
          pickCounts.set(pickId, (pickCounts.get(pickId) ?? 0) + 1);
        }
      }
    }
  }

  const topChampions = [...pickCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([championId, games]) => ({
      champion: championMap.get(championId)?.name ?? championId,
      games,
    }));

  return {
    scrimCount: data.scrims.length,
    winRate: Number(winRate.toFixed(1)),
    topChampions,
    topSynergies: [...data.synergies]
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5)
      .map((synergy) => ({
        ...synergy,
        pairLabel: `${championMap.get(synergy.championAId)?.name ?? synergy.championAId} + ${championMap.get(synergy.championBId)?.name ?? synergy.championBId}`,
      })),
    recentResults: [...data.scrims]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
      .map((scrim) => ({
        id: scrim.id,
        date: scrim.date,
        opponent: scrim.opponent,
        result: scrim.result,
      })),
  };
}

export function getPlayersWithPool() {
  return getPlayersWithPoolFromDataset(teamRepository.getDataset());
}

export function getPlayersWithPoolFromDataset(data: TeamDataset) {
  const championMap = new Map(
    data.champions.map((champion) => [champion.id, champion]),
  );

  return data.players.map((player) => ({
    ...player,
    pool: data.championPool
      .filter((entry) => entry.playerId === player.id)
      .sort((a, b) => b.proficiency - a.proficiency || b.games - a.games)
      .map((entry) => ({
        championId: entry.championId,
        championName:
          championMap.get(entry.championId)?.name ?? entry.championId,
        proficiency: entry.proficiency,
        games: entry.games,
      })),
  }));
}

export function getSynergyReport() {
  return getSynergyReportFromDataset(teamRepository.getDataset());
}

export function getSynergyReportFromDataset(data: TeamDataset) {
  const championMap = new Map(
    data.champions.map((champion) => [champion.id, champion]),
  );

  return [...data.synergies]
    .sort((a, b) => b.winRate - a.winRate)
    .map((synergy) => ({
      ...synergy,
      championA:
        championMap.get(synergy.championAId)?.name ?? synergy.championAId,
      championB:
        championMap.get(synergy.championBId)?.name ?? synergy.championBId,
    }));
}

export function getScrimHistory() {
  return getScrimHistoryFromDataset(teamRepository.getDataset());
}

export function getScrimHistoryFromDataset(data: TeamDataset) {
  return [...data.scrims]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((scrim) => {
      const gameWins = scrim.games.filter(
        (game) => game.killsFor > game.killsAgainst,
      ).length;
      const gameLosses = scrim.games.length - gameWins;

      return {
        ...scrim,
        gameScore: `${gameWins}-${gameLosses}`,
        averageDuration: Number(
          average(scrim.games.map((game) => game.durationMinutes)).toFixed(1),
        ),
      };
    });
}
