import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function DashboardCard({ title, subtitle, children }: DashboardCardProps) {
  return (
    <article className="rounded-3xl border border-border-soft bg-white/85 p-5 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-ink-strong">{title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
      {children}
    </article>
  );
}
