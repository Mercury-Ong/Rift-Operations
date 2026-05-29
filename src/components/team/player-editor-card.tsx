"use client";

import { PlayerRole } from "@/lib/models";
import {
  ChampionOption,
  PlayerEditor,
  roleOptions,
} from "@/lib/team/editor-types";
import { championOptionsForEntry } from "@/lib/team/editor-utils";

type Props = {
  editor: PlayerEditor;
  championOptions: ChampionOption[];
  saving: boolean;
  canSave: boolean;
  onUpdateEditor: (id: string, patch: Partial<PlayerEditor>) => void;
  onUpdatePoolEntry: (
    editorId: string,
    entryKey: string,
    patch: { championId?: string; comfort?: number },
  ) => void;
  onRemovePoolEntry: (editorId: string, entryKey: string) => void;
  onAddPoolEntry: (editorId: string) => void;
  onSavePlayer: (editor: PlayerEditor) => void;
  clampComfort: (value: number) => number;
};

export function PlayerEditorCard({
  editor,
  championOptions,
  saving,
  canSave,
  onUpdateEditor,
  onUpdatePoolEntry,
  onRemovePoolEntry,
  onAddPoolEntry,
  onSavePlayer,
  clampComfort,
}: Props) {
  const canAddChampion =
    editor.pool.length < championOptions.length && championOptions.length > 0;

  return (
    <article className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
      <div className="grid gap-2 md:grid-cols-2">
        <input
          value={editor.summonerName}
          onChange={(event) =>
            onUpdateEditor(editor.id, { summonerName: event.target.value })
          }
          placeholder="Player name"
          className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
        />
        <select
          value={editor.role}
          onChange={(event) =>
            onUpdateEditor(editor.id, { role: event.target.value as PlayerRole })
          }
          className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 space-y-2">
        {editor.pool.map((entry) => (
          <div key={entry.key} className="grid grid-cols-[1fr_120px_44px] gap-2">
            <select
              value={entry.championId}
              onChange={(event) =>
                onUpdatePoolEntry(editor.id, entry.key, {
                  championId: event.target.value,
                })
              }
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
            >
              {championOptionsForEntry(editor, entry.key, championOptions).map(
                (champion) => (
                  <option key={champion.id} value={champion.id}>
                    {champion.name}
                  </option>
                ),
              )}
            </select>
            <input
              type="number"
              min={1}
              max={10}
              value={entry.comfort}
              onChange={(event) =>
                onUpdatePoolEntry(editor.id, entry.key, {
                  comfort: clampComfort(Number(event.target.value)),
                })
              }
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
              aria-label="Comfort level"
            />
            <button
              onClick={() => onRemovePoolEntry(editor.id, entry.key)}
              className="rounded-xl border border-border-soft bg-white px-2 py-2 text-sm font-semibold text-ink-strong"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => onAddPoolEntry(editor.id)}
        disabled={!canAddChampion}
        className="mt-2 rounded-xl border border-border-soft bg-white px-3 py-2 text-xs font-medium text-ink-strong disabled:opacity-60"
      >
        + Champion
      </button>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-ink-soft">
          {editor.isNew ? "Unsaved new player" : `Player ID: ${editor.id}`}
        </p>
        <button
          onClick={() => onSavePlayer(editor)}
          disabled={saving || !canSave}
          className="rounded-xl bg-ink-strong px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </article>
  );
}
