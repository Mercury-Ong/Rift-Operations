"use client";

import { AppShell } from "@/components/app-shell";
import { useTeamDataset } from "@/lib/hooks/use-team-dataset";
import {
  PlayerRole,
  ScrimOutcome,
  Side,
  TeamDataset,
} from "@/lib/models";
import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeId } from "@/lib/team/editor-utils";
import { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

const roleOptions: PlayerRole[] = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

export default function CoachPage() {
  const {
    dataset,
    syncError,
    saveDataset,
    saveDatasetShared,
    refreshFromShared,
  } = useTeamDataset();

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  const [playerName, setPlayerName] = useState("");
  const [playerRole, setPlayerRole] = useState<PlayerRole>("TOP");
  const [playerRank, setPlayerRank] = useState("");
  const [playerRegion, setPlayerRegion] = useState("EUW");
  const [playerPoolLines, setPlayerPoolLines] = useState(
    "aatrox,5,20\nrenekton,4,12",
  );

  const [scrimOpponent, setScrimOpponent] = useState("");
  const [scrimDate, setScrimDate] = useState("");
  const [scrimPatch, setScrimPatch] = useState("16.11");
  const [scrimFormat, setScrimFormat] = useState<"BO3" | "BO5">("BO3");
  const [scrimResult, setScrimResult] = useState<ScrimOutcome>("WIN");
  const [scrimNotes, setScrimNotes] = useState("");
  const [scrimGamesLines, setScrimGamesLines] = useState(
    "BLUE,31,14,8,73\nRED,34,10,12,55",
  );

  const supabase = useMemo(() => getSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function persistDataset(nextDataset: TeamDataset, successText: string) {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      saveDataset(nextDataset);

      if (session) {
        await saveDatasetShared(nextDataset);
        setMessage(`${successText} Published to shared Supabase.`);
      } else {
        setMessage(`${successText} Saved locally. Sign in to publish shared.`);
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save dataset.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function onSignIn() {
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage("Signed in as coach.");
  }

  async function onSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setMessage("Signed out.");
  }

  async function onPullShared() {
    setError(null);
    await refreshFromShared();
    setMessage("Pulled latest shared dataset.");
  }

  async function onAddPlayerWithPool() {
    if (!playerName.trim()) {
      setError("Player name is required.");
      return;
    }

    const playerId = `p-${normalizeId(playerName)}`;
    if (dataset.players.some((player) => player.id === playerId)) {
      setError("A player with this generated id already exists.");
      return;
    }

    const poolRows = playerPoolLines
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const poolEntries = [] as TeamDataset["championPool"];

    for (const row of poolRows) {
      const [championRaw, proficiencyRaw, gamesRaw] = row
        .split(",")
        .map((segment) => segment.trim());

      const proficiency = Number(proficiencyRaw);
      const games = Number(gamesRaw);

      if (!championRaw || Number.isNaN(proficiency) || Number.isNaN(games)) {
        setError(
          "Champion pool rows must be: championId,proficiency,games (one row per line).",
        );
        return;
      }

      poolEntries.push({
        playerId,
        championId: normalizeId(championRaw),
        proficiency,
        games,
      });
    }

    const nextDataset: TeamDataset = {
      ...dataset,
      players: [
        ...dataset.players,
        {
          id: playerId,
          summonerName: playerName.trim(),
          role: playerRole,
          rank: playerRank.trim() || "Unranked",
          region: playerRegion.trim() || "Unknown",
        },
      ],
      championPool: [...dataset.championPool, ...poolEntries],
    };

    await persistDataset(nextDataset, "Player added.");

    setPlayerName("");
    setPlayerRank("");
    setPlayerPoolLines("");
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
      title="Coach Edit"
      subtitle="Use the forms below to add players/champion pools and scrim results."
    >
      <section className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink-strong">
              Coach Access
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Status: {session ? "Signed in (shared publish enabled)" : "Not signed in (local only)"}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {!session ? (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Coach email"
                  className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Coach password"
                  className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
                />
                <button
                  onClick={onSignIn}
                  className="rounded-xl bg-ink-strong px-3 py-2 text-sm font-semibold text-white"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onPullShared}
                  className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm font-medium text-ink-strong"
                >
                  Pull latest shared
                </button>
                <button
                  onClick={onSignOut}
                  className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm font-medium text-ink-strong"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
        {syncError ? <p className="mt-2 text-sm text-rose-700">Sync: {syncError}</p> : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-ink-strong">Add Player + Champ Pool</h3>
          <div className="mt-3 grid gap-2">
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Player name"
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
            />
            <select
              value={playerRole}
              onChange={(event) => setPlayerRole(event.target.value as PlayerRole)}
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <input
              value={playerRank}
              onChange={(event) => setPlayerRank(event.target.value)}
              placeholder="Rank (e.g. Master 200 LP)"
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
            />
            <input
              value={playerRegion}
              onChange={(event) => setPlayerRegion(event.target.value)}
              placeholder="Region (e.g. EUW)"
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
            />
            <textarea
              value={playerPoolLines}
              onChange={(event) => setPlayerPoolLines(event.target.value)}
              className="h-24 rounded-xl border border-border-soft bg-white px-3 py-2 text-xs text-ink-strong outline-none"
              placeholder="championId,proficiency,games"
            />
            <button
              onClick={onAddPlayerWithPool}
              disabled={saving}
              className="rounded-xl bg-ink-strong px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Add player
            </button>
          </div>
        </article>

        <article className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-ink-strong">Add Scrim Result</h3>
          <div className="mt-3 grid gap-2">
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
            <div className="grid grid-cols-3 gap-2">
              <input
                value={scrimPatch}
                onChange={(event) => setScrimPatch(event.target.value)}
                placeholder="Patch"
                className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
              />
              <select
                value={scrimFormat}
                onChange={(event) =>
                  setScrimFormat(event.target.value as "BO3" | "BO5")
                }
                className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
              >
                <option value="BO3">BO3</option>
                <option value="BO5">BO5</option>
              </select>
              <select
                value={scrimResult}
                onChange={(event) =>
                  setScrimResult(event.target.value as ScrimOutcome)
                }
                className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
              >
                <option value="WIN">WIN</option>
                <option value="LOSS">LOSS</option>
              </select>
            </div>
            <textarea
              value={scrimNotes}
              onChange={(event) => setScrimNotes(event.target.value)}
              className="h-16 rounded-xl border border-border-soft bg-white px-3 py-2 text-xs text-ink-strong outline-none"
              placeholder="Coach notes"
            />
            <textarea
              value={scrimGamesLines}
              onChange={(event) => setScrimGamesLines(event.target.value)}
              className="h-24 rounded-xl border border-border-soft bg-white px-3 py-2 text-xs text-ink-strong outline-none"
              placeholder="side,duration,killsFor,killsAgainst,objectiveControl"
            />
            <button
              onClick={onAddScrimResult}
              disabled={saving}
              className="rounded-xl bg-ink-strong px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Add scrim
            </button>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
