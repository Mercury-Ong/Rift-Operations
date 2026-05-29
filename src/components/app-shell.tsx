import Link from "next/link";
import { ReactNode } from "react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/team", label: "Team" },
  { href: "/scrims", label: "Scrim history" },
];

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-white/40 bg-surface-strong/95 p-5 shadow-[0_10px_40px_rgba(2,8,23,0.08)] backdrop-blur md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-accent-strong">Rift Operations</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-strong md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft md:text-base">{subtitle}</p>
          </div>
          <nav className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:justify-end">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-border-soft bg-white/65 px-4 py-2 text-sm font-medium text-ink-strong transition hover:border-accent-soft hover:bg-accent-wash"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6">{children}</main>
    </div>
  );
}

