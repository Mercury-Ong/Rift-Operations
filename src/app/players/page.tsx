"use client";

import { AppShell } from "@/components/app-shell";
import { useTeamDataset } from "@/lib/hooks/use-team-dataset";
import { getPlayersWithPoolFromDataset } from "@/lib/services/teamAnalytics";

export default function PlayersPage() {
  const { dataset } = useTeamDataset();
  const players = getPlayersWithPoolFromDataset(dataset);

  return (
    <AppShell
      title="Champion Pool Matrix"
      subtitle="Analyze role-specific comfort depth and where draft flexibility is highest or vulnerable."
    >
      <section className="grid gap-5 lg:grid-cols-2">
        {players.map((player) => (
          <article
            key={player.id}
            className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-ink-strong">
                  {player.summonerName}
                </h2>
                <p className="text-sm text-ink-soft">
                  {player.role} | {player.rank} | {player.region}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-700">
                Pool Size: {player.pool.length}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {player.pool.map((entry) => (
                <div
                  key={entry.championId}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-ink-strong">{entry.championName}</p>
                    <p className="text-ink-soft">
                      {entry.games} games | Prof. {entry.proficiency}/5
                    </p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-linear-to-r from-indigo-500 to-cyan-500"
                      style={{ width: `${Math.min(100, (entry.proficiency / 5) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

