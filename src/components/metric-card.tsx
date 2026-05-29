import { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "positive" | "focus";
  icon?: ReactNode;
}) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
      : tone === "focus"
        ? "border-accent-soft/40 bg-accent-wash"
        : "border-border-soft bg-surface-strong";

  return (
    <article className={`rounded-3xl border p-5 shadow-sm ${toneClass}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">{label}</p>
        {icon ? <span className="text-xl leading-none">{icon}</span> : null}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-ink-strong">{value}</p>
      <p className="mt-2 text-sm text-ink-soft">{detail}</p>
    </article>
  );
}

