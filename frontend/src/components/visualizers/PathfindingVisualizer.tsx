import { useEffect, useMemo, useState } from "react";
import { aStarSteps } from "../../algorithms/pathfinding/aStar";
import { dijkstraSteps } from "../../algorithms/pathfinding/dijkstra";
import { PathfindingStep } from "../../types/algorithms";

type AlgorithmKey = "dijkstra" | "astar";
type CellStatus = "empty" | "visited" | "frontier" | "path" | "start" | "goal";

const startCell: [number, number] = [0, 0];

const colors: Record<CellStatus, string> = {
  empty: "bg-slate-900/30 border-slate-800",
  visited: "bg-cyan-500/30 border-cyan-400/40",
  frontier: "bg-fuchsia-500/30 border-fuchsia-400/40",
  path: "bg-amber-400/40 border-amber-300/60",
  start: "bg-green-400/50 border-green-300/70",
  goal: "bg-red-400/50 border-red-300/70"
};

function PathfindingVisualizer() {
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>("dijkstra");
  const [rows, setRows] = useState(12);
  const [cols, setCols] = useState(18);
  const [steps, setSteps] = useState<PathfindingStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(80);

  const goalCell: [number, number] = useMemo(() => [rows - 1, cols - 1], [rows, cols]);

  useEffect(() => {
    const generator = algorithm === "astar" ? aStarSteps(rows, cols) : dijkstraSteps(rows, cols);
    setSteps(Array.from(generator));
    setStepIndex(0);
    setIsPlaying(false);
  }, [algorithm, rows, cols]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      return undefined;
    }
    const id = window.setTimeout(() => stepForward(), speed);
    return () => window.clearTimeout(id);
  }, [isPlaying, stepIndex, steps, speed]);

  const currentStep = steps[Math.min(stepIndex - 1, steps.length - 1)] ?? {
    visited: [],
    frontier: [],
    path: []
  };

  const cellStatus = (r: number, c: number): CellStatus => {
    if (r === startCell[0] && c === startCell[1]) return "start";
    if (r === goalCell[0] && c === goalCell[1]) return "goal";
    if (currentStep.path.some(([pr, pc]) => pr === r && pc === c)) return "path";
    if (currentStep.frontier.some(([fr, fc]) => fr === r && fc === c)) return "frontier";
    if (currentStep.visited.some(([vr, vc]) => vr === r && vc === c)) return "visited";
    return "empty";
  };

  const stepForward = () => {
    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleReset = () => {
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleRun = () => {
    setStepIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full bg-cyan-500/30 px-3 py-1 text-cyan-100">Pathfinding</span>
        <div className="flex gap-2">
          {(["dijkstra", "astar"] as AlgorithmKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setAlgorithm(key)}
              className={`rounded-lg border px-3 py-1 text-xs transition ${
                algorithm === key ? "border-cyan-400 text-cyan-100" : "border-slate-800 text-slate-400 hover:border-slate-600"
              }`}
            >
              {key === "dijkstra" ? "Dijkstra" : "A*"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1 space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Steps: {stepIndex}</span>
            <span>
              Grid: {rows} x {cols}
            </span>
            <span>Speed: {speed}ms</span>
          </div>
          <div
            className="grid h-[27rem] w-full gap-[2px] rounded-lg border border-slate-800 bg-[#0b1020] p-2"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: rows * cols }).map((_, idx) => {
              const r = Math.floor(idx / cols);
              const c = idx % cols;
              const status = cellStatus(r, c);
              return <div key={idx} className={`rounded-sm border ${colors[status]}`} />;
            })}
          </div>
        </div>

        <div className="w-full max-w-xs space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Controls</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRun}
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30"
            >
              Run
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100"
            >
              {isPlaying ? "Pause" : "Resume"}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={stepForward}
              className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100"
            >
              Step
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100"
            >
              Reset
            </button>
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs text-slate-400">
              <span>Speed (ms)</span>
              <span className="text-slate-100">{speed}</span>
            </label>
            <input
              type="range"
              min={30}
              max={200}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs text-slate-400">
              <span>Rows</span>
              <span className="text-slate-100">{rows}</span>
            </label>
            <input
              type="range"
              min={6}
              max={20}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full accent-fuchsia-400"
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs text-slate-400">
              <span>Cols</span>
              <span className="text-slate-100">{cols}</span>
            </label>
            <input
              type="range"
              min={8}
              max={28}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PathfindingVisualizer;
