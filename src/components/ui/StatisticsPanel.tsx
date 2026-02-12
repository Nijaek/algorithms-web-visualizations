"use client";

interface StatItem {
  label: string;
  value: string | number;
}

interface StatisticsPanelProps {
  title?: string;
  items: StatItem[];
}

export default function StatisticsPanel({
  title = "Statistics",
  items,
}: StatisticsPanelProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-1.5">
      <h4 className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">
        {title}
      </h4>
      {items.map((item) => (
        <div key={item.label} className="flex justify-between text-xs">
          <span className="text-slate-500">{item.label}</span>
          <span className="text-slate-300 font-mono">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
