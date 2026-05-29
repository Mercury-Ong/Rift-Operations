"use client";

import { AppShell } from "@/components/app-shell";
import { ResultBadge } from "@/components/result-badge";
import { useTeamDataset } from "@/lib/hooks/use-team-dataset";
import { ScrimOutcome, Side, TeamDataset } from "@/lib/models";
import { getScrimHistoryFromDataset } from "@/lib/services/teamAnalytics";
import { useState } from "react";

export default function ScrimsPage() {
  const { dataset, syncError, saveDataset, saveDatasetShared } =
    useTeamDataset();
  const scrims = getScrimHistoryFromDataset(dataset);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [scrimOpponent, setScrimOpponent] = useState("");
  const [scrimDate, setScrimDate] = useState("");
  const [scrimPatch, setScrimPatch] = useState("16.11");
  const [scrimFormat, setScrimFormat] = useState<"BO3" | "BO5">("BO3");
  const [scrimResult, setScrimResult] = useState<ScrimOutcome>("WIN");
  const [scrimNotes, setScrimNotes] = useState("");
  const [scrimGamesLines, setScrimGamesLines] = useState(
    "BLUE,31,14,8,73\nRED,34,10,12,55",
  );

  async function persistDataset(nextDataset: TeamDataset, successText: string) {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      saveDataset(nextDataset);
      await saveDatasetShared(nextDataset);
      setMessage(`${successText} Saved and synced.`);
    } catch {
      setMessage(`${successText} Saved locally. Shared sync unavailable.`);
    } finally {
      setSaving(false);
    }
  }

  async function onAddScrimResult() {
    if (!scrimOpponent.trim() || !scrimDate) {
      setError("Scrim opponent and date are required.");
      return;
    }

    const gameRows = scrimGamesLines
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!gameRows.length) {
      setError("Add at least one game line.");
      return;
    }

    const parsedGames = [] as TeamDataset["scrims"][number]["games"];

    for (const row of gameRows) {
      const [sideRaw, durationRaw, killsForRaw, killsAgainstRaw, objectiveRaw] =
        row.split(",").map((segment) => segment.trim());

      const side = sideRaw.toUpperCase() as Side;
      const durationMinutes = Number(durationRaw);
      const killsFor = Number(killsForRaw);
      const killsAgainst = Number(killsAgainstRaw);
      const objectiveControl = Number(objectiveRaw);

      if (
        (side !== "BLUE" && side !== "RED") ||
        Number.isNaN(durationMinutes) ||
        Number.isNaN(killsFor) ||
        Number.isNaN(killsAgainst) ||
        Number.isNaN(objectiveControl)
      ) {
        setError(
          "Game rows must be: side,duration,killsFor,killsAgainst,objectiveControl.",
        );
        return;
      }

      parsedGames.push({
        game: parsedGames.length + 1,
        side,
        durationMinutes,
        killsFor,
        killsAgainst,
        objectiveControl,
      });
    }

    const nextScrimId = `scrim-${String(dataset.scrims.length + 1).padStart(3, "0")}`;
    const nextDataset: TeamDataset = {
      ...dataset,
      scrims: [
        ...dataset.scrims,
        {
          id: nextScrimId,
          date: scrimDate,
          opponent: scrimOpponent.trim(),
          patch: scrimPatch.trim() || "Unknown",
          format: scrimFormat,
          result: scrimResult,
          notes: scrimNotes.trim(),
          games: parsedGames,
        },
      ],
    };

    await persistDataset(nextDataset, "Scrim added.");

    setScrimOpponent("");
    setScrimDate("");
    setScrimNotes("");
    setScrimGamesLines("");
  }

  return (
    <AppShell
      title="Scrim History"
      subtitle="Review block-by-block performance and add new scrim results from this page."
    >
      <section className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink-strong">
              Add Game (Scrim Result)
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Adds are saved locally and synced when Supabase is available.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-6">
          <input
            value={scrimOpponent}
            onChange={(event) => setScrimOpponent(event.target.value)}
            placeholder="Opponent"
            className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
          />
          <input
            type="date"
            value={scrimDate}
            onChange={(event) => setScrimDate(event.target.value)}
            className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
          />
          <input
            value={scrimPatch}
            onChange={(event) => setScrimPatch(event.target.value)}
            placeholder="Patch"
            className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
          />
          <select
            value={scrimFormat}
            onChange={(event) => setScrimFormat(event.target.value as "BO3" | "BO5")}
            className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
          >
            <option value="BO3">BO3</option>
            <option value="BO5">BO5</option>
          </select>
          <select
            value={scrimResult}
            onChange={(event) => setScrimResult(event.target.value as ScrimOutcome)}
            className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
          >
            <option value="WIN">WIN</option>
            <option value="LOSS">LOSS</option>
          </select>
          <button
            onClick={onAddScrimResult}
            disabled={saving}
            className="rounded-xl bg-ink-strong px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Add game
          </button>
        </div>

        <textarea
          value={scrimNotes}
          onChange={(event) => setScrimNotes(event.target.value)}
          className="mt-2 h-16 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-xs text-ink-strong outline-none"
          placeholder="Coach notes"
        />

        <textarea
          value={scrimGamesLines}
          onChange={(event) => setScrimGamesLines(event.target.value)}
          className="mt-2 h-24 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-xs text-ink-strong outline-none"
          placeholder="side,duration,killsFor,killsAgainst,objectiveControl"
        />

        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
        {syncError ? <p className="mt-2 text-sm text-rose-700">Sync: {syncError}</p> : null}
      </section>

      <section className="space-y-4">
        {scrims.length ? (
          scrims.map((scrim) => (
            <article
              key={scrim.id}
              className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-ink-strong">
                    vs {scrim.opponent}
                  </h2>
                  <p className="text-sm text-ink-soft">
                    {scrim.date} | Patch {scrim.patch} | {scrim.format}
                  </p>
                </div>
                <ResultBadge result={scrim.result} />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-ink-soft">Game Score</p>
                  <p className="mt-1 text-lg font-semibold text-ink-strong">{scrim.gameScore}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-ink-soft">Average Duration</p>
                  <p className="mt-1 text-lg font-semibold text-ink-strong">
                    {scrim.averageDuration}m
                  </p>
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
                      <th className="px-3">Side</th>
                      <th className="px-3">Duration</th>
                      <th className="px-3">Kills</th>
                      <th className="px-3">Objective Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scrim.games.map((game) => (
                      <tr key={game.game} className="rounded-2xl bg-slate-50 text-ink-strong">
                        <td className="rounded-l-xl px-3 py-2">{game.game}</td>
                        <td className="px-3 py-2">{game.side}</td>
                        <td className="px-3 py-2">{game.durationMinutes}m</td>
                        <td className="px-3 py-2">
                          {game.killsFor}-{game.killsAgainst}
                        </td>
                        <td className="rounded-r-xl px-3 py-2">{game.objectiveControl}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))
        ) : (
          <article className="rounded-3xl border border-border-soft bg-white/85 p-5 text-sm text-ink-soft shadow-sm">
            No scrim history yet. Add your first result above.
          </article>
        )}
      </section>
    </AppShell>
  );
}
