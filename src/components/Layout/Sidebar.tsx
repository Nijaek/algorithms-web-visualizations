type SidebarProps = {
  activeCategory: "sorting" | "pathfinding" | "kmeans" | "graph" | "datastructures";
  onChange: (category: "sorting" | "pathfinding" | "kmeans" | "graph" | "datastructures") => void;
};

const categories: {
  key: SidebarProps["activeCategory"];
  label: string;
}[] = [
  { key: "datastructures", label: "Data Structures" },
  { key: "sorting", label: "Sorting" },
  { key: "pathfinding", label: "Pathfinding" },
  { key: "graph", label: "Graph" },
  { key: "kmeans", label: "Machine Learning" }
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
        {/* Brain/ML icon */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    graph: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Clean graph/network icon */}
        <circle cx="12" cy="5" r="2" strokeWidth={2} />
        <circle cx="6" cy="12" r="2" strokeWidth={2} />
        <circle cx="18" cy="12" r="2" strokeWidth={2} />
        <circle cx="9" cy="19" r="2" strokeWidth={2} />
        <circle cx="15" cy="19" r="2" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7v0M12 7L7 11M12 7l5 4M7 13l2 5M17 13l-2 5M10 19h4" />
      </svg>
    ),
    datastructures: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  };

  return (
    <aside className="flex h-full flex-col gap-3 rounded-2xl border border-slate-800 bg-[#0c1224]/80 p-4 shadow-lg shadow-fuchsia-500/10">
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
    </aside>
  );
}

export default Sidebar;
