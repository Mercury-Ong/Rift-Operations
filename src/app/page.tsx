"use client";

import { AppShell } from "@/components/app-shell";
import { MeterBar } from "@/components/meter-bar";
import { MetricCard } from "@/components/metric-card";
import { ResultBadge } from "@/components/result-badge";
import { useTeamDataset } from "@/lib/hooks/use-team-dataset";
import { getTeamSnapshotFromDataset } from "@/lib/services/teamAnalytics";

export default function Home() {
  const { dataset } = useTeamDataset();
  const snapshot = getTeamSnapshotFromDataset(dataset);

  return (
    <AppShell
      title="Team Dashboard"
      subtitle="Track current champion priorities, coordinated draft identities, and scrim trends in one analytics-first hub."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Scrim Win Rate"
          value={`${snapshot.winRate}%`}
          detail="Based on current block history"
          tone="positive"
          icon="T"
        />
        <MetricCard
          label="Objective Control"
          value={`${snapshot.averageObjectiveControl}%`}
          detail="Average across all recorded games"
          tone="focus"
          icon="G"
        />
        <MetricCard
          label="Champion Pool Games"
          value={String(snapshot.totalPoolGames)}
          detail="Tracked player comfort sample"
          icon="C"
        />
        <MetricCard
          label="Active Roster"
          value={String(snapshot.teamSize)}
          detail={`${snapshot.scrimCount} scrim blocks in dataset`}
          icon="R"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight text-ink-strong">Most Played Champions</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Prioritize prep around the highest volume comfort picks.
          </p>
          <div className="mt-6 space-y-4">
            {snapshot.topChampions.map((entry) => (
              <div key={entry.champion} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-ink-strong">{entry.champion}</p>
                  <p className="text-ink-soft">
                    {entry.games} games | Proficiency {entry.proficiency}/5
                  </p>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500"
                    style={{ width: `${Math.min(100, (entry.games / 45) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight text-ink-strong">Role Stability</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Count of strong comfort picks per role at proficiency 4+.
          </p>
          <div className="mt-5 space-y-4">
            {snapshot.roleCoverage.map((coverage) => (
              <MeterBar
                key={coverage.player}
                label={`${coverage.role} | ${coverage.player}`}
                value={Math.min(100, coverage.stablePool * 30)}
                suffix=""
              />
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight text-ink-strong">Top Synergy Pairs</h2>
          <div className="mt-4 space-y-3">
            {snapshot.topSynergies.slice(0, 4).map((synergy) => (
              <div
                key={synergy.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-ink-strong">{synergy.pairLabel}</p>
                  <p className="text-sm text-ink-soft">
                    {synergy.lanePair} | {synergy.sampleGames} games
                  </p>
                </div>
                <p className="text-lg font-semibold text-ink-strong">{synergy.winRate}%</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight text-ink-strong">Recent Scrim Results</h2>
          <div className="mt-4 space-y-3">
            {snapshot.recentResults.map((scrim) => (
              <div
                key={scrim.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-ink-strong">{scrim.opponent}</p>
                  <p className="text-sm text-ink-soft">{scrim.date}</p>
                </div>
                <ResultBadge result={scrim.result} />
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}

