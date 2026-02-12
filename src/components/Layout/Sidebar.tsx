"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/data/algorithm-registry";
import type { AlgorithmCategory } from "@/data/algorithm-registry";

const iconMap: Record<AlgorithmCategory, React.ReactNode> = {
  sorting: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  pathfinding: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  "machine-learning": (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  graph: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="5" r="2" strokeWidth={2} />
      <circle cx="6" cy="12" r="2" strokeWidth={2} />
      <circle cx="18" cy="12" r="2" strokeWidth={2} />
      <circle cx="9" cy="19" r="2" strokeWidth={2} />
      <circle cx="15" cy="19" r="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7v0M12 7L7 11M12 7l5 4M7 13l2 5M17 13l-2 5M10 19h4" />
    </svg>
  ),
  "data-structures": (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col gap-3 rounded-2xl border border-white/[0.06] bg-surface-2/80 p-4 shadow-lg shadow-fuchsia-500/5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-medium">
        Algorithms
      </p>
      <div className="space-y-1.5">
        {categories.map((cat) => {
          const href = `/${cat.slug}/${cat.defaultAlgorithm}`;
          const isActive = pathname.startsWith(`/${cat.slug}`);
          return (
            <Link
              key={cat.slug}
              href={href}
              className={`block w-full rounded-xl border px-4 py-3 text-left transition-all duration-200 hover:border-cyan-400/40 hover:text-cyan-200 ${
                isActive
                  ? "border-cyan-400/60 bg-gradient-to-r from-surface-3 to-surface-2"
                  : "border-white/[0.04] bg-white/[0.02] text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {iconMap[cat.slug]}
                <span className="text-sm font-semibold">{cat.label}</span>
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500" />
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
