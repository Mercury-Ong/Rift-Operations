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
      ? "border-emerald-200 bg-emerald-50"
      : tone === "focus"
        ? "border-cyan-200 bg-cyan-50"
        : "border-slate-200 bg-white/90";

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

