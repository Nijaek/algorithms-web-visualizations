import { useEffect, useMemo, useState } from "react";
import { aStarSteps } from "../../algorithms/pathfinding/aStar";
import { dijkstraSteps } from "../../algorithms/pathfinding/dijkstra";
import { PathfindingStep } from "../../types/algorithms";
import { ComplexityMeta } from "../../types/complexity";

type AlgorithmKey = "dijkstra" | "astar";
type GridType = "empty" | "random" | "maze" | "none";
type CellStatus = "empty" | "visited" | "frontier" | "path" | "start" | "goal" | "wall";
type DragMode = "none" | "start" | "goal" | "wallOn" | "wallOff";

const key = (r: number, c: number) => `${r},${c}`;

const colors: Record<CellStatus, string> = {
  empty: "bg-slate-900/30 border-slate-800",
  wall: "bg-slate-600/60 border-slate-500/80",
  visited: "bg-cyan-500/30 border-cyan-400/40",
  frontier: "bg-fuchsia-500/30 border-fuchsia-400/40",
  path: "bg-amber-400/40 border-amber-300/60",
  start: "bg-green-400/60 border-green-300/80",
  goal: "bg-red-400/60 border-red-300/80"
};

type PathfindingVisualizerProps = {
  onComplexityChange?: (meta: ComplexityMeta) => void;
};

const pathfindingComplexity: Record<AlgorithmKey, ComplexityMeta> = {
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
};

function PathfindingVisualizer({ onComplexityChange }: PathfindingVisualizerProps) {
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>("dijkstra");
  const [rows, setRows] = useState(12);
  const [cols, setCols] = useState(18);
  const [start, setStart] = useState<[number, number]>([0, 0]);
  const [goal, setGoal] = useState<[number, number]>([11, 17]);
  const [walls, setWalls] = useState<Set<string>>(new Set());
  const [dragMode, setDragMode] = useState<DragMode>("none");
  const [gridType, setGridType] = useState<GridType>("empty");
  const [steps, setSteps] = useState<PathfindingStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);

  const gridScale = useMemo(() => 100 / Math.max(rows, cols), [rows, cols]);

  useEffect(() => {
    setGoal(([r, c]) => [Math.min(rows - 1, r), Math.min(cols - 1, c)]);
    setStart(([r, c]) => [Math.min(rows - 1, r), Math.min(cols - 1, c)]);
    setWalls((prev) => {
      const next = new Set<string>();
      prev.forEach((w) => {
        const [wr, wc] = w.split(",").map(Number);
        if (wr < rows && wc < cols) next.add(w);
      });
      return next;
    });
  }, [rows, cols]);

  useEffect(() => {
    const generator = (() => {
      switch (algorithm) {
        case "astar": return aStarSteps(rows, cols, start, goal, walls);
        default: return dijkstraSteps(rows, cols, start, goal, walls);
      }
    })();
    setSteps(Array.from(generator));
    setStepIndex(0);
    setIsPlaying(false);
    onComplexityChange?.(pathfindingComplexity[algorithm]);
  }, [algorithm, rows, cols, start, goal, walls]);

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
    if (r === start[0] && c === start[1]) return "start";
    if (r === goal[0] && c === goal[1]) return "goal";
    if (walls.has(key(r, c))) return "wall";
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

  const setWallAt = (r: number, c: number, makeWall: boolean) => {
    if ((r === start[0] && c === start[1]) || (r === goal[0] && c === goal[1])) return;
    setWalls((prev) => {
      const next = new Set(prev);
      const id = key(r, c);
      if (makeWall) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const clearCellWall = (r: number, c: number) => {
    setWalls((prev) => {
      const next = new Set(prev);
      next.delete(key(r, c));
      return next;
    });
  };

  const handlePointerDown = (r: number, c: number) => {
    setIsPlaying(false);
    if (r === start[0] && c === start[1]) return setDragMode("start");
    if (r === goal[0] && c === goal[1]) return setDragMode("goal");
    const makeWall = !walls.has(key(r, c));
    setWallAt(r, c, makeWall);
    setDragMode(makeWall ? "wallOn" : "wallOff");
    setGridType("none");
  };

  const handlePointerEnter = (r: number, c: number) => {
    if (dragMode === "start") {
      clearCellWall(r, c);
      setStart([r, c]);
      return;
    }
    if (dragMode === "goal") {
      clearCellWall(r, c);
      setGoal([r, c]);
      return;
    }
    if (dragMode === "wallOn") return setWallAt(r, c, true);
    if (dragMode === "wallOff") return setWallAt(r, c, false);
  };

  const handlePointerUp = () => setDragMode("none");

  const randomWalls = () => {
    const next = new Set<string>();
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if ((r === start[0] && c === start[1]) || (r === goal[0] && c === goal[1])) continue;
        if (Math.random() < 0.28) next.add(key(r, c));
      }
    }
    setWalls(next);
    setGridType("random");
  };

  const mazeWalls = () => {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(true));
    const inBounds = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols;
    const directions: Array<[number, number]> = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];

    const carve = (r: number, c: number) => {
      const shuffled = directions
        .map((d) => [d, Math.random()] as const)
        .sort((a, b) => a[1] - b[1])
        .map(([d]) => d);
      for (const [dr, dc] of shuffled) {
        const nr = r + dr * 2;
        const nc = c + dc * 2;
        if (!inBounds(nr, nc) || !grid[nr][nc]) continue;
        const midR = r + dr;
        const midC = c + dc;
        grid[midR][midC] = false;
        grid[nr][nc] = false;
        carve(nr, nc);
      }
    };

    // Start carve from top-left open cell inside the border when possible
    const startCell: [number, number] = rows > 2 && cols > 2 ? [1, 1] : [0, 0];
    grid[startCell[0]][startCell[1]] = false;
    carve(startCell[0], startCell[1]);

    const openAround = (r: number, c: number) => {
      const dirs = [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ] as const;
      dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc)) grid[nr][nc] = false;
      });
    };

    // Ensure start and goal have breathing room into the maze
    openAround(start[0], start[1]);
    openAround(goal[0], goal[1]);

    const next = new Set<string>();
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (grid[r][c]) next.add(key(r, c));
      }
    }
    setWalls(next);
    setGridType("maze");
  };

  const clearWalls = () => {
    setWalls(new Set());
    setGridType("empty");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full bg-cyan-500/30 px-3 py-1 text-cyan-100">Pathfinding</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "dijkstra" as AlgorithmKey, label: "Dijkstra" },
              { key: "astar" as AlgorithmKey, label: "A*" }
            ]
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setAlgorithm(key)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                algorithm === key
                  ? "border-cyan-400 bg-cyan-500/15 text-cyan-50"
                  : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600"
              }`}
            >
              {label}
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
            className="relative w-full aspect-[4/3] max-h-[28rem] rounded-lg border border-slate-800 bg-[#0b1020] p-3"
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="absolute inset-2 flex items-center justify-center">
              <div
                className="grid h-full w-full"
                style={{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  gap: "2px"
                }}
              >
                {Array.from({ length: rows * cols }).map((_, idx) => {
                  const r = Math.floor(idx / cols);
                  const c = idx % cols;
                  const status = cellStatus(r, c);
                  return (
                    <div
                      key={idx}
                      role="button"
                      aria-label={`cell-${r}-${c}`}
                      className={`rounded-[3px] border ${colors[status]} cursor-pointer`}
                      onPointerDown={() => handlePointerDown(r, c)}
                      onPointerEnter={() => handlePointerEnter(r, c)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Controls</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={isPlaying ? () => setIsPlaying(false) : handleRun}
              className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={stepForward}
              className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500"
            >
              Step
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500"
            >
              Reset
            </button>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-[0.12em] text-slate-500">Grid type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearWalls}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  gridType === "empty"
                    ? "border-cyan-400 text-cyan-100"
                    : "border-slate-700 text-slate-200 hover:border-slate-500"
                }`}
              >
                Empty
              </button>
              <button
                type="button"
                onClick={randomWalls}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  gridType === "random"
                    ? "border-cyan-400 text-cyan-100"
                    : "border-slate-700 text-slate-200 hover:border-slate-500"
                }`}
              >
                Random
              </button>
              <button
                type="button"
                onClick={mazeWalls}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  gridType === "maze"
                    ? "border-cyan-400 text-cyan-100"
                    : "border-slate-700 text-slate-200 hover:border-slate-500"
                }`}
              >
                Maze
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Selected: {gridType === "none" ? "None (manual)" : gridType.charAt(0).toUpperCase() + gridType.slice(1)}
            </p>
          </div>
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
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-cyan-500"
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
          <div className="text-xs text-slate-500">
            Drag green = start, red = goal. Click or drag to toggle walls. Changing grid size clamps start/goal inside the grid.
          </div>
        </div>
      </div>
    </div>
  );
}

export default PathfindingVisualizer;
