import { useState } from "react";
import TopBar from "./components/Layout/TopBar";
import Sidebar from "./components/Layout/Sidebar";
import SortingVisualizer from "./components/visualizers/SortingVisualizer";
import PathfindingVisualizer from "./components/visualizers/PathfindingVisualizer";
import KMeansVisualizer from "./components/visualizers/KMeansVisualizer";
import MetricsPanel from "./components/metrics/MetricsPanel";
import ComplexityInfo from "./components/metrics/ComplexityInfo";
import "./styles/globals.css";

type AlgorithmCategory = "sorting" | "pathfinding" | "kmeans";

const complexityMap: Record<AlgorithmCategory, { name: string; complexity: string }> = {
  sorting: { name: "Merge Sort", complexity: "O(n log n)" },
  pathfinding: { name: "Dijkstra", complexity: "O((V + E) log V)" },
  kmeans: { name: "K-Means", complexity: "O(k n t)" }
};

function App() {
  const [activeCategory, setActiveCategory] = useState<AlgorithmCategory>("sorting");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] to-[#05070f] text-slate-100">
      <TopBar />
      <div className="grid grid-cols-[280px_1fr] gap-6 px-6 pb-10">
        <Sidebar activeCategory={activeCategory} onChange={setActiveCategory} />
        <main className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0c1224]/80 p-4 shadow-lg shadow-cyan-500/10">
            {activeCategory === "sorting" && <SortingVisualizer />}
            {activeCategory === "pathfinding" && <PathfindingVisualizer />}
            {activeCategory === "kmeans" && <KMeansVisualizer />}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <MetricsPanel />
            <ComplexityInfo title={complexityMap[activeCategory].name} complexity={complexityMap[activeCategory].complexity} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
