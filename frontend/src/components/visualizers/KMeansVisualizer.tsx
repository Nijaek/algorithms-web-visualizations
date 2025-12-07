import { useEffect, useMemo, useState } from "react";
import { KMeansStep } from "../../types/algorithms";
import { KMeansPoint, generatePoints, kmeansSteps } from "../../algorithms/kmeans/kmeans";
import { ComplexityMeta } from "../../types/complexity";

const palette = ["#ff2d95", "#2de2e6", "#f8d210", "#3df29b", "#a855f7", "#fb7185"];

type KMeansVisualizerProps = {
  onComplexityChange?: (meta: ComplexityMeta) => void;
};

const kmeansComplexity: ComplexityMeta = {
  name: "Lloyd's k-means",
  best: "O(n k t)",
  average: "O(n k t)",
  worst: "O(n k t)",
  description: "Iteratively assigns points to nearest centroids and recenters them until assignments stabilize."
};

function KMeansVisualizer({ onComplexityChange }: KMeansVisualizerProps) {
  const [points, setPoints] = useState<KMeansPoint[]>(() => generatePoints(60));
  const [clusters, setClusters] = useState(3);
  const [steps, setSteps] = useState<KMeansStep[]>([]);
  const [centroids, setCentroids] = useState<KMeansPoint[]>([]);
  const [assignments, setAssignments] = useState<number[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(140);

  useEffect(() => {
    const generator = kmeansSteps(points, clusters, 8);
    const all = Array.from(generator);
    setSteps(all);
    setCentroids(all[0]?.centroids ?? []);
    setAssignments(new Array(points.length).fill(-1));
    setStepIndex(0);
    setIsPlaying(false);
    onComplexityChange?.(kmeansComplexity);
  }, [points, clusters]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      return undefined;
    }
    const id = window.setTimeout(() => stepForward(), speed);
    return () => window.clearTimeout(id);
  }, [isPlaying, stepIndex, steps, speed]);

  const stepForward = () => {
    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      return;
    }
    const step = steps[stepIndex];
    setCentroids(step.centroids);
    setAssignments(step.assignments);
    setStepIndex((i) => i + 1);
  };

  const handleReset = () => {
    setPoints(generatePoints(points.length));
  };

  const canvasPoints = useMemo(
    () => points.map((p, idx) => ({ ...p, color: assignments[idx] >= 0 ? palette[assignments[idx] % palette.length] : "#475569" })),
    [points, assignments]
  );

  const handleRun = () => {
    setStepIndex(0);
    setCentroids(steps[0]?.centroids ?? []);
    setAssignments(new Array(points.length).fill(-1));
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full bg-amber-400/30 px-3 py-1 text-amber-100">K-Means</span>
        <span className="text-slate-500">Iterative clustering of 2D points</span>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1 space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Steps: {stepIndex}</span>
            <span>
              Points: {points.length} • k = {clusters}
            </span>
            <span>Speed: {speed}ms</span>
          </div>
          <div className="relative w-full aspect-[4/3] max-h-[28rem] overflow-hidden rounded-lg border border-slate-800 bg-[#0b1020]">
            {canvasPoints.map((p, idx) => (
              <div
                key={idx}
                className="absolute h-3 w-3 rounded-full border border-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                style={{
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  background: p.color
                }}
              />
            ))}
            {centroids.map((c, idx) => (
              <div
                key={`c-${idx}`}
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                style={{
                  left: `${c.x * 100}%`,
                  top: `${c.y * 100}%`,
                  background: palette[idx % palette.length]
                }}
              />
            ))}
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
              min={50}
              max={250}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs text-slate-400">
              <span>Points</span>
              <span className="text-slate-100">{points.length}</span>
            </label>
            <input
              type="range"
              min={20}
              max={120}
              value={points.length}
              onChange={(e) => setPoints(generatePoints(Number(e.target.value)))}
              className="w-full accent-fuchsia-400"
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs text-slate-400">
              <span>Clusters (k)</span>
              <span className="text-slate-100">{clusters}</span>
            </label>
            <input
              type="range"
              min={2}
              max={6}
              value={clusters}
              onChange={(e) => setClusters(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default KMeansVisualizer;
