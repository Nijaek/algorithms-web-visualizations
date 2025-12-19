type ComplexityInfoProps = {
  title: string;
  best: string;
  average: string;
  worst: string;
  description: string;
};

function ComplexityInfo({ title, best, average, worst, description }: ComplexityInfoProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-inner shadow-fuchsia-500/5">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Time Complexity</p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-slate-200">
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2 text-center">
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Best</p>
          <p className="text-fuchsia-200">{best}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2 text-center">
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Average</p>
          <p className="text-fuchsia-200">{average}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2 text-center">
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Worst</p>
          <p className="text-fuchsia-200">{worst}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-400 leading-relaxed">{description}</p>
    </section>
  );
}

export default ComplexityInfo;
