function TopBar() {
  return (
    <header className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-slate-800 bg-[#0b1020]/80 px-2 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 via-cyan-400 to-amber-300 shadow-lg shadow-cyan-500/30" />
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">NeonAlgo Lab</p>
          <p className="text-lg font-semibold text-slate-100">Interactive Algorithm Playground</p>
        </div>
      </div>
      <div className="rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs text-slate-300 shadow-lg shadow-fuchsia-500/10">
        v0.1 scaffold
      </div>
    </header>
  );
}

export default TopBar;
