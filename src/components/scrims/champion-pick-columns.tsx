import { Champion } from "@/lib/models";
import {
  SCRIM_ROLE_LABELS,
  SCRIM_ROLE_ORDER,
} from "@/lib/scrims/form-utils";

interface ChampionPickColumnsProps {
  championOptions: Champion[];
  bluePicks: string[];
  redPicks: string[];
  onBluePickChange: (index: number, championId: string) => void;
  onRedPickChange: (index: number, championId: string) => void;
}

function ChampionPickList({
  title,
  picks,
  championOptions,
  onPickChange,
}: {
  title: string;
  picks: string[];
  championOptions: Champion[];
  onPickChange: (index: number, championId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border-soft bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{title}</p>
      <div className="mt-2 grid gap-2">
        {picks.map((championId, index) => (
          <label key={`${title}-${index + 1}`} className="grid gap-1 text-xs text-ink-soft">
            {SCRIM_ROLE_LABELS[SCRIM_ROLE_ORDER[index]]}
            <select
              value={championId}
              onChange={(event) => onPickChange(index, event.target.value)}
              className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-ink-strong outline-none"
            >
              <option value="">Select {SCRIM_ROLE_LABELS[SCRIM_ROLE_ORDER[index]]}</option>
              {championOptions
                .filter((champion) =>
                  champion.laneTags.includes(SCRIM_ROLE_ORDER[index]),
                )
                .map((champion) => (
                  <option key={champion.id} value={champion.id}>
                    {champion.name}
                  </option>
                ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ChampionPickColumns({
  championOptions,
  bluePicks,
  redPicks,
  onBluePickChange,
  onRedPickChange,
}: ChampionPickColumnsProps) {
  return (
    <div className="mt-2 grid gap-2 md:grid-cols-2">
      <ChampionPickList
        title="Blue Picks"
        picks={bluePicks}
        championOptions={championOptions}
        onPickChange={onBluePickChange}
      />
      <ChampionPickList
        title="Red Picks"
        picks={redPicks}
        championOptions={championOptions}
        onPickChange={onRedPickChange}
      />
    </div>
  );
}
