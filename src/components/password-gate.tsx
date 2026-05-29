"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";

const SESSION_KEY = "lol-team-tracker-auth";
const DEFAULT_PASSWORD_HASH =
  "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5"; // 12345

async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return sessionStorage.getItem(SESSION_KEY) === "ok";
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const expectedHash = useMemo(
    () => process.env.NEXT_PUBLIC_ACCESS_PASSWORD_HASH ?? DEFAULT_PASSWORD_HASH,
    [],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!expectedHash) {
      setError("Access password is not configured for this deployment.");
      setLoading(false);
      return;
    }

    const computedHash = await sha256(input);
    if (computedHash !== expectedHash) {
      setError("Incorrect password.");
      setLoading(false);
      return;
    }

    sessionStorage.setItem(SESSION_KEY, "ok");
    setIsUnlocked(true);
    setLoading(false);
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(14,165,233,0.18),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(245,158,11,0.18),transparent_35%),linear-gradient(180deg,#f8fbff_0%,#e8f3ff_100%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.15)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-strong">
          Rift Operations
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-strong">
          Team Access
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Enter the team password to unlock champion pools, synergies, and scrim analytics.
        </p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-ink-strong" htmlFor="team-password">
            Password
          </label>
          <input
            id="team-password"
            type="password"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="w-full rounded-2xl border border-border-soft bg-white/90 px-4 py-3 text-sm text-ink-strong outline-none transition focus:border-accent-soft"
            placeholder="Enter shared team password"
            autoComplete="current-password"
            required
          />

          {error ? <p className="text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-ink-strong px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking..." : "Unlock Dashboard"}
          </button>
        </form>

        <p className="mt-4 text-xs text-ink-soft">
          Note: This is a frontend gate for shared team access and is not equivalent to server-side security.
        </p>
      </div>
    </div>
  );
}
