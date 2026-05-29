import { ReactNode } from "react";

interface DashboardListRowProps {
  left: ReactNode;
  right: ReactNode;
}

export function DashboardListRow({ left, right }: DashboardListRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      {left}
      {right}
    </div>
  );
}
