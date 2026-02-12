"use client";

import { useAlgorithm } from "@/contexts/AlgorithmContext";

export default function ComplexityInfo() {
  const { complexity } = useAlgorithm();

  if (!complexity) return null;

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-surface-2/80 p-4 shadow-inner shadow-fuchsia-500/5">
      <p className="text-sm font-semibold text-slate-100">{complexity.name}</p>
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
        Time Complexity
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-slate-200">
        {(["best", "average", "worst"] as const).map((tier) => (
          <div
            key={tier}
            className="rounded-lg border border-white/[0.04] bg-surface-0/60 p-2 text-center"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              {tier}
            </p>
            <p className="text-fuchsia-200 font-mono text-xs">
              {complexity[tier]}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-400 leading-relaxed">
        {complexity.description}
      </p>
    </section>
  );
}
