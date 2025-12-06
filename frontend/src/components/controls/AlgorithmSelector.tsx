type AlgorithmSelectorProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function AlgorithmSelector({ label, options, value, onChange }: AlgorithmSelectorProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default AlgorithmSelector;
