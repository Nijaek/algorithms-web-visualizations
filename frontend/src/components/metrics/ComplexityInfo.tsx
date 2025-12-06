type ComplexityInfoProps = {
  title: string;
  complexity: string;
};

function ComplexityInfo({ title, complexity }: ComplexityInfoProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-inner shadow-fuchsia-500/5">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Complexity</p>
      <p className="mt-2 text-lg text-fuchsia-200">{complexity}</p>
      <p className="mt-3 text-sm text-slate-400">
        Placeholder copy. Replace with friendly explanations plus best/worst/average cases for each algorithm.
      </p>
    </section>
  );
}

export default ComplexityInfo;
