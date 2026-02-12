"use client";

import Image from "next/image";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-surface-1/80 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <a
          href="https://nijae.dev"
          className="relative h-10 w-10 rounded-xl shadow-lg overflow-hidden block hover:scale-105 transition-transform"
        >
          <Image src="/favicon.svg" alt="Logo" width={40} height={40} />
        </a>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-blue-400">
            nijae.dev
          </p>
          <p className="text-lg font-semibold text-slate-100">
            Interactive Algorithm Playground
          </p>
        </div>
      </div>
      <div className="rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs text-slate-400 shadow-lg shadow-fuchsia-500/5">
        v2.00
      </div>
    </header>
  );
}
