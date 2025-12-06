type Metric = { label: string; value: string };

const defaultMetrics: Metric[] = [
  { label: "Steps", value: "—" },
  { label: "Elapsed", value: "—" },
  { label: "Array Size", value: "—" },
  { label: "API Benchmark", value: "Pending" }
];

function MetricsPanel() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-inner shadow-cyan-500/5">
      <header className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-100">Metrics</p>
        <span className="text-xs text-slate-500">wired later</span>
      </header>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {defaultMetrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{metric.label}</p>
            <p className="text-base text-cyan-100">{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MetricsPanel;
