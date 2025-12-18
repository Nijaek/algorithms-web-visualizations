type SidebarProps = {
  activeCategory: "sorting" | "pathfinding" | "kmeans" | "graph";
  onChange: (category: "sorting" | "pathfinding" | "kmeans" | "graph") => void;
};

const categories: {
  key: SidebarProps["activeCategory"];
  label: string;
}[] = [
  { key: "sorting", label: "Sorting" },
  { key: "pathfinding", label: "Pathfinding" },
  { key: "kmeans", label: "K-Means" },
  { key: "graph", label: "Graph" }
];

function Sidebar({ activeCategory, onChange }: SidebarProps) {
  const iconMap = {
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
    kmeans: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    graph: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="5" cy="12" r="3" />
        <circle cx="19" cy="5" r="3" />
        <circle cx="19" cy="19" r="3" />
        <circle cx="12" cy="8" r="3" />
        <circle cx="12" cy="16" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l7-4m0 0l7-3m-7 3l7 7m-7-7v8" />
      </svg>
    )
  };

  return (
    <aside className="flex h-[calc(100vh-120px)] flex-col gap-3 rounded-2xl border border-slate-800 bg-[#0c1224]/80 p-4 shadow-lg shadow-fuchsia-500/10">
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
              <div className="flex items-center gap-3">
                {iconMap[cat.key]}
                <span className="font-semibold">{cat.label}</span>
                <span className="h-2 w-2 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 ml-auto" />
              </div>
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
