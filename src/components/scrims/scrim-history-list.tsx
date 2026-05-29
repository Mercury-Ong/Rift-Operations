import { SCRIM_ROLE_LABELS, SCRIM_ROLE_ORDER } from "@/lib/scrims/form-utils";

interface ScrimGameView {
  game: number;
  durationMinutes: number;
  killsFor: number;
  killsAgainst: number;
  bluePicks?: string[];
  redPicks?: string[];
}

interface ScrimHistoryItem {
  id: string;
  opponent: string;
  date: string;
  result: "WIN" | "LOSS";
  notes: string;
  gameScore: string;
  averageDuration: number;
  games: ScrimGameView[];
}

interface ScrimHistoryListProps {
  scrims: ScrimHistoryItem[];
  championNameById: Map<string, string>;
}

function RolePicks({
  picks,
  championNameById,
}: {
  picks: string[] | undefined;
  championNameById: Map<string, string>;
}) {
  return (
    <div className="space-y-1 text-xs">
      {SCRIM_ROLE_ORDER.map((role, index) => {
        const championId = picks?.[index] ?? "";
        const championName = championId
          ? championNameById.get(championId) ?? championId
          : "-";

        return (
          <p key={`${role}-${index}`}>
            <span className="font-semibold">{SCRIM_ROLE_LABELS[role]}:</span> {championName}
          </p>
        );
      })}
    </div>
  );
}

export function ScrimHistoryList({
  scrims,
  championNameById,
}: ScrimHistoryListProps) {
  if (!scrims.length) {
    return (
      <article className="rounded-3xl border border-border-soft bg-white/85 p-5 text-sm text-ink-soft shadow-sm">
        No scrim history yet. Add your first result above.
      </article>
    );
  }

  return (
    <>
      {scrims.map((scrim) => (
        <article
          key={scrim.id}
          className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink-strong">
                vs {scrim.opponent}
              </h2>
              <p className="text-sm text-ink-soft">{scrim.date}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                scrim.result === "WIN"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {scrim.result}
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-ink-soft">Game Score</p>
              <p className="mt-1 text-lg font-semibold text-ink-strong">{scrim.gameScore}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-ink-soft">Average Duration</p>
              <p className="mt-1 text-lg font-semibold text-ink-strong">{scrim.averageDuration}m</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-ink-soft">Notes</p>
              <p className="mt-1 text-sm text-ink-strong">{scrim.notes}</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-ink-soft">
                  <th className="px-3">Game</th>
                  <th className="px-3">Duration</th>
                  <th className="px-3">Kill Score (Blue:Red)</th>
                  <th className="px-3">Blue Picks</th>
                  <th className="px-3">Red Picks</th>
                </tr>
              </thead>
              <tbody>
                {scrim.games.map((game) => (
                  <tr key={game.game} className="rounded-2xl bg-slate-50 text-ink-strong">
                    <td className="rounded-l-xl px-3 py-2">{game.game}</td>
                    <td className="px-3 py-2">{game.durationMinutes}m</td>
                    <td className="px-3 py-2">
                      {game.killsFor}-{game.killsAgainst}
                    </td>
                    <td className="px-3 py-2">
                      <RolePicks picks={game.bluePicks} championNameById={championNameById} />
                    </td>
                    <td className="rounded-r-xl px-3 py-2">
                      <RolePicks picks={game.redPicks} championNameById={championNameById} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </>
  );
}
