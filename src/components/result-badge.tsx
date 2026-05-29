export function ResultBadge({ result }: { result: "WIN" | "LOSS" }) {
  const className =
    result === "WIN"
      ? "border-emerald-300 bg-emerald-100 text-emerald-800"
      : "border-rose-300 bg-rose-100 text-rose-800";

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold tracking-wide ${className}`}>
      {result}
    </span>
  );
}

