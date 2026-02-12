"use client";

interface StepCounterItem {
  label: string;
  value: string | number;
}

interface StepCounterProps {
  items: StepCounterItem[];
  algorithmName?: string;
}

export default function StepCounter({ items, algorithmName }: StepCounterProps) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-500">
      <div className="flex items-center gap-4">
        {items.map((item) => (
          <span key={item.label}>
            {item.label}: <span className="text-slate-400">{item.value}</span>
          </span>
        ))}
      </div>
      {algorithmName && (
        <span className="text-cyan-400/80 font-medium">{algorithmName}</span>
      )}
    </div>
  );
}
