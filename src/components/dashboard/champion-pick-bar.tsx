interface ChampionPickBarProps {
  champion: string;
  games: number;
  /** The highest game count in the list — used to scale the bar. Must be ≥ 1. */
  maxGames: number;
}

export function ChampionPickBar({ champion, games, maxGames }: ChampionPickBarProps) {
  const widthPct = Math.min(100, (games / maxGames) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium text-ink-strong">{champion}</p>
        <p className="text-ink-soft">{games} games</p>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500"
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}
