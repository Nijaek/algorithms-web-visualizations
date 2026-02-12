"use client";

type AccentColor = "fuchsia" | "cyan" | "green" | "purple" | "amber";

const colorMap: Record<AccentColor, string> = {
  fuchsia: "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30",
  cyan: "bg-cyan-500/20 text-cyan-200 border-cyan-500/30",
  green: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  purple: "bg-purple-500/20 text-purple-200 border-purple-500/30",
  amber: "bg-amber-500/20 text-amber-200 border-amber-500/30",
};

interface NeonBadgeProps {
  label: string;
  color: AccentColor;
  className?: string;
}

export default function NeonBadge({ label, color, className = "" }: NeonBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${colorMap[color]} ${className}`}
    >
      {label}
    </span>
  );
}
