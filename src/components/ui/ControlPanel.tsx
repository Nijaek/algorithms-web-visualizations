"use client";

interface ControlPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ControlPanel({
  title = "Controls",
  children,
  className = "",
}: ControlPanelProps) {
  return (
    <div
      className={`w-full md:w-80 shrink-0 space-y-3 rounded-2xl border border-white/[0.06] bg-surface-2/80 p-4 text-sm text-slate-200 overflow-y-auto max-h-full ${className}`}
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-medium">
        {title}
      </p>
      {children}
    </div>
  );
}
