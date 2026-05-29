"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PlayerRole } from "@/lib/models";
import {
  ChampionOption,
  PlayerEditor,
  PoolEditorEntry,
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
  onDeletePlayer: (editor: PlayerEditor) => void;
  onReorderPool: (editorId: string, newPool: PoolEditorEntry[]) => void;
  clampComfort: (value: number) => number;
};

function SortablePoolRow({
  entry,
  editorId,
  editor,
  championOptions,
  onUpdatePoolEntry,
  onRemovePoolEntry,
}: {
  entry: PoolEditorEntry;
  editorId: string;
  editor: PlayerEditor;
  championOptions: ChampionOption[];
  onUpdatePoolEntry: Props["onUpdatePoolEntry"];
  onRemovePoolEntry: Props["onRemovePoolEntry"];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[24px_1fr_120px_44px] gap-2 items-center"
    >
      {/* drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center justify-center rounded text-ink-soft hover:text-ink-strong active:cursor-grabbing"
        aria-label="Drag to reorder"
        tabIndex={0}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="4" cy="3" r="1.2" />
          <circle cx="10" cy="3" r="1.2" />
          <circle cx="4" cy="7" r="1.2" />
          <circle cx="10" cy="7" r="1.2" />
          <circle cx="4" cy="11" r="1.2" />
          <circle cx="10" cy="11" r="1.2" />
        </svg>
      </button>

      <select
        value={entry.championId}
        onChange={(event) =>
          onUpdatePoolEntry(editorId, entry.key, { championId: event.target.value })
        }
        className="rounded-xl border border-border-soft bg-surface-strong px-3 py-2 text-sm text-ink-strong outline-none"
      >
        {championOptionsForEntry(editor, entry.key, championOptions).map((champion) => (
          <option key={champion.id} value={champion.id}>
            {champion.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={1}
        max={10}
        value={entry.comfort}
        onChange={(event) =>
          onUpdatePoolEntry(editorId, entry.key, {
            comfort: Number(event.target.value),
          })
        }
        className="rounded-xl border border-border-soft bg-surface-strong px-3 py-2 text-sm text-ink-strong outline-none"
        aria-label="Comfort level"
      />

      <button
        onClick={() => onRemovePoolEntry(editorId, entry.key)}
        className="rounded-xl border border-border-soft bg-surface-strong px-2 py-2 text-sm font-semibold text-ink-strong hover:border-rose-400 hover:text-rose-500"
      >
        ×
      </button>
    </div>
  );
}

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
  onDeletePlayer,
  onReorderPool,
  clampComfort,
}: Props) {
  const canAddChampion =
    editor.pool.length < championOptions.length && championOptions.length > 0;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = editor.pool.findIndex((e) => e.key === active.id);
    const newIndex = editor.pool.findIndex((e) => e.key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorderPool(editor.id, arrayMove(editor.pool, oldIndex, newIndex));
  }

  return (
    <article className="rounded-3xl border border-border-soft bg-surface-strong p-5 shadow-sm">
      {/* header row: name / role / delete */}
      <div className="grid gap-2 md:grid-cols-[1fr_1fr_44px]">
        <input
          value={editor.summonerName}
          onChange={(event) =>
            onUpdateEditor(editor.id, { summonerName: event.target.value })
          }
          placeholder="Player name"
          className="rounded-xl border border-border-soft bg-surface-strong px-3 py-2 text-sm text-ink-strong outline-none"
        />
        <select
          value={editor.role}
          onChange={(event) =>
            onUpdateEditor(editor.id, { role: event.target.value as PlayerRole })
          }
          className="rounded-xl border border-border-soft bg-surface-strong px-3 py-2 text-sm text-ink-strong outline-none"
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button
          onClick={() => onDeletePlayer(editor)}
          className="rounded-xl border border-rose-300 bg-rose-50 px-2 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/70"
          aria-label="Delete player"
          title="Delete player"
        >
          🗑
        </button>
      </div>

      {/* champion pool rows — sortable */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={editor.pool.map((e) => e.key)}
          strategy={verticalListSortingStrategy}
        >
          <div className="mt-3 space-y-2">
            {editor.pool.map((entry) => (
              <SortablePoolRow
                key={entry.key}
                entry={entry}
                editorId={editor.id}
                editor={editor}
                championOptions={championOptions}
                onUpdatePoolEntry={(editorId, entryKey, patch) =>
                  onUpdatePoolEntry(editorId, entryKey, {
                    ...patch,
                    comfort: patch.comfort !== undefined
                      ? clampComfort(patch.comfort)
                      : undefined,
                  })
                }
                onRemovePoolEntry={onRemovePoolEntry}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={() => onAddPoolEntry(editor.id)}
        disabled={!canAddChampion}
        className="mt-2 rounded-xl border border-border-soft bg-surface-strong px-3 py-2 text-xs font-medium text-ink-strong disabled:opacity-60"
      >
        + Champion
      </button>

      <div className="mt-3 flex items-center justify-between">
        {editor.isNew ? (
          <p className="text-xs text-ink-soft">Unsaved new player</p>
        ) : null}
        <button
          onClick={() => onSavePlayer(editor)}
          disabled={saving || !canSave}
          className="rounded-xl bg-cta-bg px-4 py-2 text-sm font-semibold text-cta-text disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </article>
  );
}
