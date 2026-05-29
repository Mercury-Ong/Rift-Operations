export function MeterBar({
  label,
  value,
  suffix = "%",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium text-ink-strong">{label}</p>
        <p className="text-ink-soft">
          {value}
          {suffix}
        </p>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-linear-to-r from-cyan-500 to-blue-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

