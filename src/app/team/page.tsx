"use client";

import { AppShell } from "@/components/app-shell";
import { PlayerEditorCard } from "@/components/team/player-editor-card";
import { useTeamDataset } from "@/lib/hooks/use-team-dataset";
import { Player, TeamDataset } from "@/lib/models";
import { PlayerEditor, PoolEditorEntry } from "@/lib/team/editor-types";
import {
  clampComfort,
  editorFromPlayer,
  hasDuplicateChampions,
  nextPlayerId,
  nextPoolEntry,
} from "@/lib/team/editor-utils";
import { useMemo, useState } from "react";

export default function TeamPage() {
  const { dataset, syncError, saveDataset, saveDatasetShared } = useTeamDataset();

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [newEditors, setNewEditors] = useState<PlayerEditor[]>([]);
  const [existingOverrides, setExistingOverrides] = useState<Record<string, PlayerEditor>>({});

  const championOptions = useMemo(
    () => dataset.champions.map((champion) => ({ id: champion.id, name: champion.name })),
    [dataset.champions],
  );

  const existingEditors = useMemo(
    () =>
      dataset.players.map((player) => {
        const base = editorFromPlayer(player, dataset.championPool);
        return existingOverrides[player.id] ?? base;
      }),
    [dataset, existingOverrides],
  );

  const editors = useMemo(() => [...newEditors, ...existingEditors], [newEditors, existingEditors]);
  const editorById = useMemo(
    () => new Map(editors.map((editor) => [editor.id, editor])),
    [editors],
  );

  function onAddPlayer() {
    const now = Date.now();
    const starterPoolEntry = nextPoolEntry(championOptions);

    setNewEditors((previous) => [
      {
        id: `new-${now}`,
        isNew: true,
        summonerName: "",
        role: "TOP",
        pool: starterPoolEntry ? [starterPoolEntry] : [],
      },
      ...previous,
    ]);
  }

  function getDatasetEditorById(id: string): PlayerEditor | null {
    const player = dataset.players.find((item) => item.id === id);
    if (!player) {
      return null;
    }

    return editorFromPlayer(player, dataset.championPool);
  }

  function updateEditor(id: string, patch: Partial<PlayerEditor>) {
    if (id.startsWith("new-")) {
      setNewEditors((previous) =>
        previous.map((editor) => (editor.id === id ? { ...editor, ...patch } : editor)),
      );
      return;
    }

    setExistingOverrides((previous) => {
      const base = previous[id] ?? getDatasetEditorById(id);
      if (!base) {
        return previous;
      }

      return {
        ...previous,
        [id]: { ...base, ...patch },
      };
    });
  }

  function updatePoolEntry(editorId: string, entryKey: string, patch: Partial<PoolEditorEntry>) {
    const target = editorById.get(editorId);
    if (!target) {
      return;
    }

    const pool = target.pool.map((entry) => (entry.key === entryKey ? { ...entry, ...patch } : entry));
    updateEditor(editorId, { pool });
  }

  function addPoolEntry(editorId: string) {
    const target = editorById.get(editorId);
    if (!target) {
      return;
    }

    const poolEntry = nextPoolEntry(championOptions, target.pool);
    if (!poolEntry) {
      return;
    }

    updateEditor(editorId, { pool: [...target.pool, poolEntry] });
  }

  function removePoolEntry(editorId: string, entryKey: string) {
    const target = editorById.get(editorId);
    if (!target) {
      return;
    }

    updateEditor(editorId, { pool: target.pool.filter((entry) => entry.key !== entryKey) });
  }
  async function savePlayer(editor: PlayerEditor) {
    if (!editor.summonerName.trim()) {
      setError("Player name is required before saving.");
      return;
    }

    if (!editor.pool.length) {
      setError("Add at least one champion in the pool before saving.");
      return;
    }

    for (const entry of editor.pool) {
      if (!entry.championId) {
        setError("Every champion pool row must have a selected champion.");
        return;
      }
    }

    if (hasDuplicateChampions(editor.pool)) {
      setError("A player cannot have the same champion twice in the pool.");
      return;
    }

    const existingIds = new Set(dataset.players.map((player) => player.id));
    if (!editor.isNew) {
      existingIds.delete(editor.id);
    }

    const resolvedId = editor.isNew
      ? nextPlayerId(editor.summonerName, existingIds)
      : editor.id;

    const updatedPlayer: Player = {
      id: resolvedId,
      summonerName: editor.summonerName.trim(),
      role: editor.role,
      rank: "N/A",
      region: "N/A",
    };

    const filteredPlayers = dataset.players.filter((player) => player.id !== editor.id);
    const filteredPool = dataset.championPool.filter((entry) => entry.playerId !== editor.id);

    const nextDataset: TeamDataset = {
      ...dataset,
      players: [...filteredPlayers, updatedPlayer],
      championPool: [
        ...filteredPool,
        ...editor.pool.map((entry) => ({
          playerId: resolvedId,
          championId: entry.championId,
          proficiency: clampComfort(entry.comfort),
          games: 1,
        })),
      ],
    };

    setSavingId(editor.id);
    setError(null);
    setMessage(null);

    try {
      saveDataset(nextDataset);
      await saveDatasetShared(nextDataset);
      setMessage(`Saved ${updatedPlayer.summonerName} and synced.`);
    } catch {
      setMessage(`Saved ${updatedPlayer.summonerName} locally.`);
    } finally {
      setSavingId(null);
      if (editor.isNew) {
        setNewEditors((previous) => previous.filter((item) => item.id !== editor.id));
      } else {
        setExistingOverrides((previous) => {
          const copy = { ...previous };
          delete copy[editor.id];
          return copy;
        });
      }
    }
  }

  return (
    <AppShell
      title="Team"
      subtitle="Manage team members and evolving champion pools with per-player saves."
    >
      <section className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink-strong">Roster</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Use + Player to add a card, adjust champion comfort (1-10), then save each player.
            </p>
          </div>
          <button
            onClick={onAddPlayer}
            className="rounded-xl bg-ink-strong px-4 py-2 text-sm font-semibold text-white"
          >
            + Player
          </button>
        </div>

        {!championOptions.length ? (
          <p className="mt-3 text-sm text-amber-700">
            No champions found in dataset yet. Add champions first so the dropdown has options.
          </p>
        ) : null}

        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
        {syncError ? <p className="mt-2 text-sm text-rose-700">Sync: {syncError}</p> : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {editors.length ? (
          editors.map((editor) => (
            <PlayerEditorCard
              key={editor.id}
              editor={editor}
              championOptions={championOptions}
              saving={savingId === editor.id}
              canSave={championOptions.length > 0}
              onUpdateEditor={updateEditor}
              onUpdatePoolEntry={updatePoolEntry}
              onRemovePoolEntry={removePoolEntry}
              onAddPoolEntry={addPoolEntry}
              onSavePlayer={savePlayer}
              clampComfort={clampComfort}
            />
          ))
        ) : (
          <article className="rounded-3xl border border-border-soft bg-white/85 p-5 text-sm text-ink-soft shadow-sm">
            No team members yet. Click + Player to start.
          </article>
        )}
      </section>
    </AppShell>
  );
}
