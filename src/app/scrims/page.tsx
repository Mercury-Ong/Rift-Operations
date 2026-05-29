"use client";

import { AppShell } from "@/components/app-shell";
import { ChampionPickColumns } from "@/components/scrims/champion-pick-columns";
import { ScrimHistoryList } from "@/components/scrims/scrim-history-list";
import { useTeamDataset } from "@/lib/hooks/use-team-dataset";
import { ScrimOutcome, TeamDataset } from "@/lib/models";
import {
  arePicksComplete,
  arePicksUnique,
  createEmptyPicks,
  parseKillScore,
} from "@/lib/scrims/form-utils";
import { getScrimHistoryFromDataset } from "@/lib/services/teamAnalytics";
import { useMemo, useState } from "react";

export default function ScrimsPage() {
  const { dataset, syncError, saveDataset, saveDatasetShared } =
    useTeamDataset();
  const scrims = getScrimHistoryFromDataset(dataset);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [scrimOpponent, setScrimOpponent] = useState("");
  const [scrimDate, setScrimDate] = useState("");
  const [scrimResult, setScrimResult] = useState<ScrimOutcome>("WIN");
  const [scrimNotes, setScrimNotes] = useState("");
  const [scrimDuration, setScrimDuration] = useState("30");
  const [scrimKillScore, setScrimKillScore] = useState("12:8");
  const [bluePicks, setBluePicks] = useState<string[]>(createEmptyPicks);
  const [redPicks, setRedPicks] = useState<string[]>(createEmptyPicks);

  const championOptions = useMemo(
    () => [...dataset.champions].sort((a, b) => a.name.localeCompare(b.name)),
    [dataset.champions],
  );
  const championNameById = useMemo(
    () => new Map(dataset.champions.map((champion) => [champion.id, champion.name])),
    [dataset.champions],
  );

  function updateBluePick(index: number, championId: string) {
    setBluePicks((previous) =>
      previous.map((pick, pickIndex) => (pickIndex === index ? championId : pick)),
    );
  }

  function updateRedPick(index: number, championId: string) {
    setRedPicks((previous) =>
      previous.map((pick, pickIndex) => (pickIndex === index ? championId : pick)),
    );
  }

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

    const durationMinutes = Number(scrimDuration);
    const parsedKillScore = parseKillScore(scrimKillScore);

    if (
      Number.isNaN(durationMinutes) ||
      !parsedKillScore
    ) {
      setError("Duration must be numeric and kill score must be in Blue:Red format (e.g. 21:15).");
      return;
    }

    const killsFor = parsedKillScore.blueKills;
    const killsAgainst = parsedKillScore.redKills;

    if (!arePicksComplete(bluePicks, redPicks)) {
      setError("Select all 5 blue picks and all 5 red picks.");
      return;
    }

    if (!arePicksUnique(bluePicks, redPicks)) {
      setError("Champion picks must be unique across both teams.");
      return;
    }

    const parsedGames: TeamDataset["scrims"][number]["games"] = [
      {
        game: 1,
        side: "BLUE",
        durationMinutes,
        killsFor,
        killsAgainst,
        objectiveControl: 0,
        bluePicks,
        redPicks,
      },
    ];

    const nextScrimId = `scrim-${String(dataset.scrims.length + 1).padStart(3, "0")}`;
    const nextDataset: TeamDataset = {
      ...dataset,
      scrims: [
        ...dataset.scrims,
        {
          id: nextScrimId,
          date: scrimDate,
          opponent: scrimOpponent.trim(),
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
    setScrimDuration("30");
    setScrimKillScore("12:8");
    setBluePicks(createEmptyPicks());
    setRedPicks(createEmptyPicks());
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

        <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Opponent
            <input
              value={scrimOpponent}
              onChange={(event) => setScrimOpponent(event.target.value)}
              placeholder="Opponent"
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink-strong outline-none"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Date
            <input
              type="date"
              value={scrimDate}
              onChange={(event) => setScrimDate(event.target.value)}
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink-strong outline-none"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Result
            <select
              value={scrimResult}
              onChange={(event) => setScrimResult(event.target.value as ScrimOutcome)}
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink-strong outline-none"
            >
              <option value="WIN">WIN</option>
              <option value="LOSS">LOSS</option>
            </select>
          </label>
          <div className="grid items-end">
            <button
              onClick={onAddScrimResult}
              disabled={saving}
              className="rounded-xl bg-ink-strong px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Add scrim
            </button>
          </div>
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Duration (minutes)
            <input
              type="number"
              min={1}
              value={scrimDuration}
              onChange={(event) => setScrimDuration(event.target.value)}
              placeholder="Duration (minutes)"
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink-strong outline-none"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Kill Score (Blue:Red)
            <input
              value={scrimKillScore}
              onChange={(event) => setScrimKillScore(event.target.value)}
              placeholder="e.g. 21:15"
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink-strong outline-none"
            />
          </label>
        </div>

        <ChampionPickColumns
          championOptions={championOptions}
          bluePicks={bluePicks}
          redPicks={redPicks}
          onBluePickChange={updateBluePick}
          onRedPickChange={updateRedPick}
        />

        <textarea
          value={scrimNotes}
          onChange={(event) => setScrimNotes(event.target.value)}
          className="mt-2 h-16 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-xs text-ink-strong outline-none"
          placeholder="Coach notes"
        />

        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
        {syncError ? <p className="mt-2 text-sm text-rose-700">Sync: {syncError}</p> : null}
      </section>

      <section className="space-y-4">
        <ScrimHistoryList scrims={scrims} championNameById={championNameById} />
      </section>
    </AppShell>
  );
}
