"use client";

import { AppShell } from "@/components/app-shell";
import { MeterBar } from "@/components/meter-bar";
import { useTeamDataset } from "@/lib/hooks/use-team-dataset";
import { getSynergyReportFromDataset } from "@/lib/services/teamAnalytics";

export default function SynergiesPage() {
  const { dataset } = useTeamDataset();
  const synergies = getSynergyReportFromDataset(dataset);

  return (
    <AppShell
      title="Synergy Lab"
      subtitle="Focus prep time on pairings that consistently convert lane advantage into win probability."
    >
      <section className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-ink-strong">Champion Pair Efficiency</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Sorted by pair win rate with sample size context.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {synergies.map((synergy) => (
            <article
              key={synergy.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-ink-strong">
                    {synergy.championA} + {synergy.championB}
                  </h3>
                  <p className="text-sm text-ink-soft">{synergy.lanePair}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                  {synergy.sampleGames} games
                </div>
              </div>
              <MeterBar label="Pair win rate" value={synergy.winRate} />
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

