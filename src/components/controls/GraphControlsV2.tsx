import { GraphGeneratorType } from "../../algorithms/graph/types";
import { checkCompatibility } from "../../algorithms/graph/utils/requirements";

type GraphControlsProps = {
  algorithm: "prim" | "topo" | "bellman" | "bfs" | "dfs";
  onAlgorithmChange: (algo: "prim" | "topo" | "bellman" | "bfs" | "dfs") => void;
  numNodes: number;
  onNumNodesChange: (num: number) => void;
  graphType: GraphGeneratorType;
  onGraphTypeChange: (type: GraphGeneratorType) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onRegenerate?: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  compatibleGenerators?: GraphGeneratorType[];
  // New props for target-based search
  useTargetSearch?: boolean;
  setUseTargetSearch?: (enabled: boolean) => void;
  targetNode?: number | null;
  setTargetNode?: (node: number | null) => void;
  startNode?: number;
  setStartNode?: (node: number) => void;
  numAvailableNodes?: number;
};

export default function GraphControlsV2({
  algorithm,
  onAlgorithmChange,
  numNodes,
  onNumNodesChange,
  graphType,
  onGraphTypeChange,
  isPlaying,
  onPlay,
  onPause,
  onStep,
  onReset,
  onRegenerate,
  speed,
  onSpeedChange,
  compatibleGenerators = ['complete', 'tree', 'dag', 'weighted-random'],
  useTargetSearch = false,
  setUseTargetSearch,
  targetNode,
  setTargetNode,
  startNode = 0,
  setStartNode,
  numAvailableNodes = 8
}: GraphControlsProps) {
  // Check compatibility for current algorithm-generator pair
  const { compatible, reason } = checkCompatibility(
    algorithm === 'prim' ? 'prim-mst' :
    algorithm === 'topo' ? 'topological-sort' :
    algorithm === 'bellman' ? 'bellman-ford' :
    algorithm,
    graphType
  );

  const isTraversalAlgorithm = algorithm === 'bfs' || algorithm === 'dfs';

  return (
    <div className="w-full max-w-xs space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200 max-h-full overflow-y-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Controls</p>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">Algorithm</label>
        <select
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as "prim" | "topo" | "bellman" | "bfs" | "dfs")}
          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm"
        >
          <option value="prim">Prim's MST</option>
          <option value="topo">Topological Sort</option>
          <option value="bellman">Bellman-Ford</option>
          <option value="bfs">Breadth-First Search</option>
          <option value="dfs">Depth-First Search</option>
        </select>
      </div>

      {/* Graph type is now automatically selected based on algorithm */}
      <div className="space-y-1">
        <label className="text-xs text-slate-400">Graph Type</label>
        <div className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-300">
          {graphType.replace('-', ' ').replace('dag', 'DAG').replace('weighted-random', 'Weighted Random')}
        </div>
      </div>

      <div className="space-y-1">
        <label className="flex items-center justify-between text-xs text-slate-400">
          <span>Nodes</span>
          <span className="text-slate-100">{numNodes}</span>
        </label>
        <input
          type="range"
          min={5}
          max={12}
          value={numNodes}
          onChange={(e) => onNumNodesChange(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
      </div>

      {/* Target search options for traversal algorithms */}
      {isTraversalAlgorithm && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Target Search</p>
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Start Node</label>
              <select
                value={startNode}
                onChange={(e) => setStartNode?.(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-2 py-1 text-sm"
              >
                {Array.from({ length: numAvailableNodes }, (_, i) => (
                  <option key={i} value={i} disabled={i === targetNode}>
                    Node {i} {i === targetNode && '(target)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Target Node</label>
              <select
                value={targetNode ?? ''}
                onChange={(e) => setTargetNode?.(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-2 py-1 text-sm"
              >
                {Array.from({ length: numAvailableNodes }, (_, i) => (
                  <option key={i} value={i} disabled={i === startNode}>
                    Node {i} {i === startNode && '(start)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!compatible}
          className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={onStep}
          disabled={!compatible || isPlaying}
          className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500 disabled:opacity-50"
        >
          Step
        </button>
        <button
          onClick={onReset}
          className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500"
        >
          Reset
        </button>
      </div>

      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Regenerate
        </button>
      )}

      <div className="space-y-1">
        <label className="flex items-center justify-between text-xs text-slate-400">
          <span>Speed (ms)</span>
          <span className="text-cyan-400">{speed}</span>
        </label>
        <input
          type="range"
          min={50}
          max={800}
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
      </div>
    </div>
  );
}