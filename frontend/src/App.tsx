import { useEffect, useState } from "react";
import TopBar from "./components/Layout/TopBar";
import Sidebar from "./components/Layout/Sidebar";
import SortingVisualizer from "./components/visualizers/SortingVisualizer";
import PathfindingVisualizer from "./components/visualizers/PathfindingVisualizer";
import KMeansVisualizer from "./components/visualizers/KMeansVisualizer";
import GraphVisualizerV2 from "./components/visualizers/GraphVisualizerV2";
import MetricsPanel from "./components/metrics/MetricsPanel";
import ComplexityInfo from "./components/metrics/ComplexityInfo";
import { ComplexityMeta } from "./types/complexity";
import "./styles/globals.css";

type AlgorithmCategory = "sorting" | "pathfinding" | "kmeans" | "graph";

const complexityTable: Record<
  AlgorithmCategory,
  Record<string, ComplexityMeta>
> = {
  sorting: {
    merge: {
      name: "Merge Sort",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
      description: "Stable divide-and-conquer sort that splits, sorts recursively, then merges sorted halves."
    },
    quick: {
      name: "Quick Sort",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n^2)",
      description: "Partition-based sort that recursively orders elements around pivots; fast in practice but quadratic on bad pivots."
    },
    heap: {
      name: "Heap Sort",
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
      description: "Builds a heap then repeatedly extracts max/min to produce a sorted array in-place."
    },
    bubble: {
      name: "Bubble Sort",
      best: "O(n)",
      average: "O(n^2)",
      worst: "O(n^2)",
      description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order."
    },
    insertion: {
      name: "Insertion Sort",
      best: "O(n)",
      average: "O(n^2)",
      worst: "O(n^2)",
      description: "Builds the final sorted array one item at a time by inserting each element into its proper position."
    },
    selection: {
      name: "Selection Sort",
      best: "O(n^2)",
      average: "O(n^2)",
      worst: "O(n^2)",
      description: "Repeatedly finds the minimum element and places it at the beginning of the unsorted portion."
    }
  },
  pathfinding: {
    dijkstra: {
      name: "Dijkstra (binary heap)",
      best: "O(E)",
      average: "O((V + E) log V)",
      worst: "O((V + E) log V)",
      description: "Finds shortest paths on weighted, non-negative graphs by expanding the lowest-distance frontier first."
    },
    astar: {
      name: "A* Search (Manhattan)",
      best: "O(E)",
      average: "O(E log V)",
      worst: "O(E log V)",
      description: "Guided shortest-path search using a heuristic to prioritize nodes estimated closest to the goal."
    }
  },
  kmeans: {
    kmeans: {
      name: "Lloyd's k-means",
      best: "O(n k t)",
      average: "O(n k t)",
      worst: "O(n k t)",
      description: "Iteratively assigns points to nearest centroids and recenters them until assignments stabilize."
    }
  },
  graph: {
    prim: {
      name: "Prim's MST",
      best: "O(E log V)",
      average: "O(E log V)",
      worst: "O(E log V)",
      description: "Finds a minimum spanning tree by adding the cheapest edge connecting the tree to a new vertex."
    },
    topo: {
      name: "Topological Sort",
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)",
      description: "Linear ordering of vertices in a directed acyclic graph where each vertex appears before its outgoing edges."
    },
    bellman: {
      name: "Bellman-Ford",
      best: "O(VE)",
      average: "O(VE)",
      worst: "O(VE)",
      description: "Single-source shortest path algorithm that handles negative weight edges and detects negative cycles."
    },
    bfs: {
      name: "Breadth-First Search",
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)",
      description: "Graph traversal that explores all neighbors at the current depth before moving deeper."
    },
    dfs: {
      name: "Depth-First Search",
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)",
      description: "Graph traversal that explores as far as possible along each branch before backtracking."
    }
  }
};

function App() {
  const [activeCategory, setActiveCategory] = useState<AlgorithmCategory>("sorting");
  const [activeComplexity, setActiveComplexity] = useState<ComplexityMeta>(complexityTable.sorting.merge);

  useEffect(() => {
    const defaults: Record<AlgorithmCategory, ComplexityMeta> = {
      sorting: complexityTable.sorting.merge,
      pathfinding: complexityTable.pathfinding.dijkstra,
      kmeans: complexityTable.kmeans.kmeans,
      graph: complexityTable.graph.prim
    };
    setActiveComplexity(defaults[activeCategory]);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] to-[#05070f] text-slate-100">
      <TopBar />
      <div className="grid grid-cols-[280px_1fr] gap-6 px-6 pb-10">
        <Sidebar activeCategory={activeCategory} onChange={setActiveCategory} />
        <main className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0c1224]/80 p-4 shadow-lg shadow-cyan-500/10">
            {activeCategory === "sorting" && <SortingVisualizer onComplexityChange={setActiveComplexity} />}
            {activeCategory === "pathfinding" && <PathfindingVisualizer onComplexityChange={setActiveComplexity} />}
            {activeCategory === "kmeans" && <KMeansVisualizer onComplexityChange={setActiveComplexity} />}
            {activeCategory === "graph" && <GraphVisualizerV2 onComplexityChange={setActiveComplexity} />}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <MetricsPanel />
            <ComplexityInfo
              title={activeComplexity.name}
              best={activeComplexity.best}
              average={activeComplexity.average}
              worst={activeComplexity.worst}
              description={activeComplexity.description}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
