"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAlgorithm } from "@/contexts/AlgorithmContext";
import {
  VisualizerLayout,
  AlgorithmPills,
  ControlPanel,
  PlaybackControls,
  SpeedSlider,
  RangeSlider,
  StepCounter,
  VisualizationCanvas,
} from "@/components/ui";
import { getAlgorithm, getAlgorithmsForCategory } from "@/data/algorithm-registry";
import { PathfindingStep } from "@/types/algorithms";
import { dijkstraSteps } from "@/algorithms/pathfinding/dijkstra";
import { aStarSteps } from "@/algorithms/pathfinding/aStar";
import { bfsSteps } from "@/algorithms/pathfinding/bfs";
import { dfsSteps } from "@/algorithms/pathfinding/dfs";
import { greedyBestFirstSteps } from "@/algorithms/pathfinding/greedyBestFirst";

type CellStatus = "empty" | "visited" | "frontier" | "path" | "start" | "goal" | "wall";
type DragMode = "none" | "start" | "goal" | "wallOn" | "wallOff";
type GridType = "empty" | "random" | "maze" | "none";

const key = (r: number, c: number) => `${r},${c}`;

const cellColors: Record<CellStatus, string> = {
  empty: "bg-slate-900/30 border-slate-800",
  wall: "bg-slate-600/60 border-slate-500/80",
  visited: "bg-cyan-500/30 border-cyan-400/40",
  frontier: "bg-fuchsia-500/30 border-fuchsia-400/40",
  path: "bg-amber-400/40 border-amber-300/60",
  start: "bg-green-400/60 border-green-300/80",
  goal: "bg-red-400/60 border-red-300/80",
};

const slugToGen: Record<string, (rows: number, cols: number, start: [number, number], goal: [number, number], walls: Set<string>) => Generator<PathfindingStep>> = {
  dijkstra: dijkstraSteps,
  "a-star": aStarSteps,
  "bfs-pathfinding": bfsSteps,
  "dfs-pathfinding": dfsSteps,
  "greedy-best-first": greedyBestFirstSteps,
};

const pathAlgorithms = getAlgorithmsForCategory("pathfinding").map((a) => ({
  key: a.id,
  label: a.name,
}));

interface Props {
  initialAlgorithm: string;
}

export default function PathfindingVisualizerClient({ initialAlgorithm }: Props) {
  const router = useRouter();
  const { setComplexity } = useAlgorithm();
  const [algorithm, setAlgorithm] = useState(initialAlgorithm);
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

  const handleAlgorithmChange = (slug: string) => {
    setAlgorithm(slug);
    router.push(`/pathfinding/${slug}`, { scroll: false });
  };

  useEffect(() => {
    const entry = getAlgorithm(algorithm);
    if (entry) setComplexity(entry.complexity);
  }, [algorithm, setComplexity]);

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
    const gen = slugToGen[algorithm] ?? slugToGen.dijkstra;
    setSteps(Array.from(gen(rows, cols, start, goal, walls)));
    setStepIndex(0);
    setIsPlaying(false);
  }, [algorithm, rows, cols, start, goal, walls]);

  useEffect(() => {
    if (!isPlaying || stepIndex >= steps.length) {
      if (isPlaying) setIsPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setStepIndex((i) => i + 1), speed);
    return () => window.clearTimeout(id);
  }, [isPlaying, stepIndex, steps, speed]);

  const currentStep = steps[Math.min(stepIndex - 1, steps.length - 1)] ?? { visited: [], frontier: [], path: [] };

  const cellStatus = (r: number, c: number): CellStatus => {
    if (r === start[0] && c === start[1]) return "start";
    if (r === goal[0] && c === goal[1]) return "goal";
    if (walls.has(key(r, c))) return "wall";
    if (currentStep.path.some(([pr, pc]) => pr === r && pc === c)) return "path";
    if (currentStep.frontier.some(([fr, fc]) => fr === r && fc === c)) return "frontier";
    if (currentStep.visited.some(([vr, vc]) => vr === r && vc === c)) return "visited";
    return "empty";
  };

  const setWallAt = (r: number, c: number, makeWall: boolean) => {
    if ((r === start[0] && c === start[1]) || (r === goal[0] && c === goal[1])) return;
    setWalls((prev) => {
      const next = new Set(prev);
      makeWall ? next.add(key(r, c)) : next.delete(key(r, c));
      return next;
    });
  };

  const clearCellWall = (r: number, c: number) => {
    setWalls((prev) => { const n = new Set(prev); n.delete(key(r, c)); return n; });
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
    if (dragMode === "start") { clearCellWall(r, c); setStart([r, c]); return; }
    if (dragMode === "goal") { clearCellWall(r, c); setGoal([r, c]); return; }
    if (dragMode === "wallOn") setWallAt(r, c, true);
    if (dragMode === "wallOff") setWallAt(r, c, false);
  };

  const randomWalls = () => {
    const next = new Set<string>();
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if ((r === start[0] && c === start[1]) || (r === goal[0] && c === goal[1])) continue;
        if (Math.random() < 0.28) next.add(key(r, c));
      }
    setWalls(next);
    setGridType("random");
  };

  const mazeWalls = () => {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(true));
    const inB = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols;
    const dirs: [number, number][] = [[1,0],[-1,0],[0,1],[0,-1]];
    const carve = (r: number, c: number) => {
      const shuffled = dirs.map((d) => [d, Math.random()] as const).sort((a, b) => a[1] - b[1]).map(([d]) => d);
      for (const [dr, dc] of shuffled) {
        const nr = r + dr * 2, nc = c + dc * 2;
        if (!inB(nr, nc) || !grid[nr][nc]) continue;
        grid[r + dr][c + dc] = false;
        grid[nr][nc] = false;
        carve(nr, nc);
      }
    };
    const sc: [number, number] = rows > 2 && cols > 2 ? [1, 1] : [0, 0];
    grid[sc[0]][sc[1]] = false;
    carve(sc[0], sc[1]);
    const open = (r: number, c: number) => {
      for (const [dr, dc] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]) {
        const nr = r + dr, nc = c + dc;
        if (inB(nr, nc)) grid[nr][nc] = false;
      }
    };
    open(start[0], start[1]);
    open(goal[0], goal[1]);
    const next = new Set<string>();
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c]) next.add(key(r, c));
    setWalls(next);
    setGridType("maze");
  };

  return (
    <VisualizerLayout
      badge="Pathfinding"
      badgeColor="cyan"
      pills={<AlgorithmPills algorithms={pathAlgorithms} active={algorithm} onChange={handleAlgorithmChange} accentColor="cyan" />}
      infoBar={
        <StepCounter
          items={[
            { label: "Steps", value: stepIndex },
            { label: "Grid", value: `${rows}×${cols}` },
            { label: "Speed", value: `${speed}ms` },
          ]}
          algorithmName={pathAlgorithms.find((a) => a.key === algorithm)?.label}
        />
      }
      controls={
        <ControlPanel title="Controls">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlay={() => { setStepIndex(0); setIsPlaying(true); }}
            onPause={() => setIsPlaying(false)}
            onStep={() => stepIndex < steps.length && setStepIndex((i) => i + 1)}
            onReset={() => { setStepIndex(0); setIsPlaying(false); }}
            totalSteps={steps.length}
            currentStep={stepIndex}
          />

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Grid type</label>
            <div className="flex gap-1.5">
              {(["empty", "random", "maze"] as const).map((type) => (
                <button key={type} type="button"
                  onClick={type === "empty" ? () => { setWalls(new Set()); setGridType("empty"); } : type === "random" ? randomWalls : mazeWalls}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    gridType === type ? "border-cyan-400/60 text-cyan-100" : "border-white/[0.06] text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <SpeedSlider value={speed} onChange={setSpeed} min={50} max={800} />
          <RangeSlider label="Rows" value={rows} onChange={setRows} min={6} max={20} />
          <RangeSlider label="Cols" value={cols} onChange={setCols} min={8} max={28} />

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Drag green = start, red = goal. Click or drag to toggle walls.
          </p>
        </ControlPanel>
      }
    >
      <VisualizationCanvas>
        <div
          className="absolute inset-2 flex items-center justify-center"
          onPointerUp={() => setDragMode("none")}
          onPointerLeave={() => setDragMode("none")}
        >
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: "2px",
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
                  className={`rounded-[3px] border ${cellColors[status]} cursor-pointer`}
                  onPointerDown={() => handlePointerDown(r, c)}
                  onPointerEnter={() => handlePointerEnter(r, c)}
                />
              );
            })}
          </div>
        </div>
      </VisualizationCanvas>
    </VisualizerLayout>
  );
}
