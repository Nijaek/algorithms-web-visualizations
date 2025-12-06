type SidebarProps = {
  activeCategory: "sorting" | "pathfinding" | "kmeans";
  onChange: (category: "sorting" | "pathfinding" | "kmeans") => void;
};

const categories: { key: SidebarProps["activeCategory"]; label: string; hint: string }[] = [
  { key: "sorting", label: "Sorting", hint: "Merge / Quick / Heap" },
  { key: "pathfinding", label: "Pathfinding", hint: "Dijkstra / A*" },
  { key: "kmeans", label: "K-Means", hint: "2D clustering" }
];

function Sidebar({ activeCategory, onChange }: SidebarProps) {
  return (
    <aside className="flex h-[calc(100vh-96px)] flex-col gap-3 rounded-2xl border border-slate-800 bg-[#0c1224]/80 p-4 shadow-lg shadow-fuchsia-500/10">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Algorithms</p>
      <div className="space-y-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onChange(cat.key)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition hover:border-cyan-400/60 hover:text-cyan-200 ${
                isActive
                  ? "border-cyan-400/80 bg-gradient-to-r from-[#102040] to-[#0d162f]"
                  : "border-slate-800 bg-slate-900/40 text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{cat.label}</span>
                <span className="h-2 w-2 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500" />
              </div>
              <p className="text-xs text-slate-400">{cat.hint}</p>
            </button>
          );
        })}
      </div>
      <div className="mt-auto rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
        Scaffold note: hook controls and API wiring here.
      </div>
    </aside>
  );
}

export default Sidebar;
