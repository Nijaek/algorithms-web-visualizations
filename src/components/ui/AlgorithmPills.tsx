"use client";

type AccentColor = "fuchsia" | "cyan" | "green" | "purple" | "amber";

const activeColorMap: Record<AccentColor, string> = {
  fuchsia: "border-fuchsia-400/70 bg-fuchsia-500/15 text-fuchsia-50",
  cyan: "border-cyan-400/70 bg-cyan-500/15 text-cyan-50",
  green: "border-emerald-400/70 bg-emerald-500/15 text-emerald-50",
  purple: "border-purple-400/70 bg-purple-500/15 text-purple-50",
  amber: "border-amber-400/70 bg-amber-500/15 text-amber-50",
};

interface AlgorithmPillsProps<T extends string> {
  algorithms: { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
  accentColor?: AccentColor;
}

export default function AlgorithmPills<T extends string>({
  algorithms,
  active,
  onChange,
  accentColor = "cyan",
}: AlgorithmPillsProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {algorithms.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
            active === key
              ? activeColorMap[accentColor]
              : "border-white/[0.06] bg-white/[0.03] text-slate-400 hover:border-slate-600 hover:text-slate-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
