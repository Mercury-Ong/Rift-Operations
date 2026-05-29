"use client";

import { ChampionPickBar } from "@/components/dashboard/champion-pick-bar";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { ResultBadge } from "@/components/result-badge";
import { useTeamDataset } from "@/lib/hooks/use-team-dataset";
import { getDashboardInsightsFromDataset } from "@/lib/services/dashboardInsights";
import { getTeamSnapshotFromDataset } from "@/lib/services/teamAnalytics";
import { useMemo } from "react";

export default function Home() {
  const { dataset } = useTeamDataset();
  const snapshot = useMemo(() => getTeamSnapshotFromDataset(dataset), [dataset]);
  const insights = useMemo(() => getDashboardInsightsFromDataset(dataset), [dataset]);

  // Scale champion bars relative to the highest-count champion, not a hardcoded cap
  const maxChampionGames = Math.max(1, ...snapshot.topChampions.map((e) => e.games));

  return (
    <AppShell
      title="Team Dashboard"
      subtitle="Champion priorities, draft synergies, scrim trends and macro guides in one hub."
    >
      {/* Row 1 – Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Scrim Win Rate"
          value={`${snapshot.winRate}%`}
          detail={`${snapshot.scrimCount} scrim block${snapshot.scrimCount !== 1 ? "s" : ""} recorded`}
          tone="positive"
          icon="🏆"
        />
        <MetricCard
          label="Avg Kill Delta"
          value={insights.formattedKillDelta}
          detail="Blue kills minus red kills per game"
          tone={insights.killDeltaTone}
          icon="⚔️"
        />
        <MetricCard
          label="Avg Game Length"
          value={`${insights.averageGameDuration}m`}
          detail="Average across all tracked scrim games"
          tone="focus"
          icon="⏱️"
        />
        <MetricCard
          label="Draft Diversity"
          value={`${insights.draftDiversity}%`}
          detail="Unique champion share across scrim picks"
          tone="neutral"
          icon="🎯"
        />
      </section>

      {/* Row 2 – Most Played + Synergies */}
      <section className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Most Played Champions"
          subtitle="Highest-volume picks from scrim history (team side only)."
        >
          <div className="mt-5 space-y-4">
            {snapshot.topChampions.length ? (
              snapshot.topChampions.map((entry) => (
                <ChampionPickBar
                  key={entry.champion}
                  champion={entry.champion}
                  games={entry.games}
                  maxGames={maxChampionGames}
                />
              ))
            ) : (
              <p className="text-sm text-ink-soft">No data yet. Add scrims to populate this.</p>
            )}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Top Synergy Pairs"
          subtitle="Best-performing champion pairings from synergy data."
        >
          <div className="mt-4 space-y-3">
            {snapshot.topSynergies.length ? (
              snapshot.topSynergies.map((synergy) => (
                <DashboardListRow
                  key={synergy.id}
                  left={
                    <div>
                      <p className="font-medium text-ink-strong">{synergy.pairLabel}</p>
                      <p className="text-sm text-ink-soft">{synergy.lanePair} | {synergy.sampleGames} games</p>
                    </div>
                  }
                  right={
                    <p className="text-lg font-semibold text-ink-strong">{synergy.winRate}%</p>
                  }
                />
              ))
            ) : (
              <p className="text-sm text-ink-soft">No synergy records yet. Add pairs in the synergies page.</p>
            )}
          </div>
        </DashboardCard>
      </section>

      {/* Row 3 – Suggested Champion Matches per role */}
      <section>
        <DashboardCard
          title="Suggested Champion Matches"
          subtitle="Most-picked champion and backup per role from scrim history."
        >
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {insights.suggestedMatches.map((match) => (
              <div
                key={match.role}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  {match.roleLabel}
                </p>
                <p className="mt-1 font-semibold text-ink-strong">{match.primaryChampion}</p>
                <p className="text-sm text-ink-soft">Backup: {match.backupChampion}</p>
                <p className="mt-2 text-xs text-ink-soft">{match.player}</p>
                <p className="text-xs text-ink-soft">{match.confidenceText}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>

      {/* Row 4 – Recent Scrims */}
      <section>
        <DashboardCard
          title="Recent Scrim Results"
          subtitle="Last 8 scrim blocks sorted by date."
        >
          <div className="mt-4 space-y-3">
            {snapshot.recentResults.length ? (
              snapshot.recentResults.map((scrim) => (
                <DashboardListRow
                  key={scrim.id}
                  left={
                    <div>
                      <p className="font-medium text-ink-strong">{scrim.opponent}</p>
                      <p className="text-sm text-ink-soft">{scrim.date}</p>
                    </div>
                  }
                  right={<ResultBadge result={scrim.result} />}
                />
              ))
            ) : (
              <p className="text-sm text-ink-soft">No scrim results yet.</p>
            )}
          </div>
        </DashboardCard>
      </section>
    </AppShell>
  );
}

