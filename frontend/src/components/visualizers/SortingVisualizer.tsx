import { useEffect, useMemo, useState } from "react";
import { heapSortSteps } from "../../algorithms/sorting/heapSort";
import { mergeSortSteps } from "../../algorithms/sorting/mergeSort";
import { quickSortSteps } from "../../algorithms/sorting/quickSort";
import { SortingStep } from "../../types/algorithms";
import { ComplexityMeta } from "../../types/complexity";

type AlgorithmKey = "merge" | "quick" | "heap";

const algorithms: { key: AlgorithmKey; label: string }[] = [
  { key: "merge", label: "Merge Sort" },
  { key: "quick", label: "Quick Sort" },
  { key: "heap", label: "Heap Sort" }
];

const complexityByAlgo: Record<AlgorithmKey, ComplexityMeta> = {
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
  }
};

const colors = ["#ff2d95", "#2de2e6", "#f8d210", "#3df29b", "#7c3aed", "#f97316"];

const generateArray = (size: number) =>
  Array.from({ length: size }, () => 5 + Math.floor(Math.random() * 95));

function applyStep(array: number[], step: SortingStep): number[] {
  const next = [...array];
  if (step.type === "swap") {
    const [i, j] = step.indices;
    [next[i], next[j]] = [next[j], next[i]];
  }
  if (step.type === "overwrite") {
    next[step.index] = step.value;
  }
  if (step.type === "done") {
    return [...step.array];
  }
  return next;
}

type SortingVisualizerProps = {
  onComplexityChange?: (meta: ComplexityMeta) => void;
};

function SortingVisualizer({ onComplexityChange }: SortingVisualizerProps) {
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>("merge");
  const [size, setSize] = useState(42);
  const [baseArray, setBaseArray] = useState<number[]>(() => generateArray(42));
  const [displayArray, setDisplayArray] = useState<number[]>(baseArray);
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(40); // ms per step
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const maxValue = useMemo(() => Math.max(...displayArray, 100), [displayArray]);

  useEffect(() => {
    const generator = (() => {
      if (algorithm === "quick") return quickSortSteps(baseArray);
      if (algorithm === "heap") return heapSortSteps(baseArray);
      return mergeSortSteps(baseArray);
    })();
    const allSteps = Array.from(generator);
    setSteps(allSteps);
    setDisplayArray([...baseArray]);
    setStepIndex(0);
    setIsPlaying(false);
    setActiveIndices([]);
    setIsComplete(false);
    onComplexityChange?.(complexityByAlgo[algorithm]);
  }, [algorithm, baseArray]);

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
    setDisplayArray((prev) => applyStep(prev, step));
    if (step.type === "compare") {
      setActiveIndices(step.indices);
    } else if (step.type === "swap") {
      setActiveIndices(step.indices);
    } else if (step.type === "overwrite") {
      setActiveIndices([step.index]);
    } else if (step.type === "done") {
      setActiveIndices([]);
      setIsComplete(true);
    } else {
      setActiveIndices([]);
    }
    setStepIndex((idx) => idx + 1);
    if (step.type === "done") {
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    const arr = generateArray(size);
    setBaseArray(arr);
  };

  const handlePauseToggle = () => {
    setIsPlaying((p) => !p);
  };

  const handleRun = () => {
    setDisplayArray([...baseArray]);
    setStepIndex(0);
    setActiveIndices([]);
    setIsComplete(false);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full bg-fuchsia-500/30 px-3 py-1 text-fuchsia-100">Sorting</span>
        <div className="flex flex-wrap gap-2">
          {algorithms.map(({ key, label }) => (
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
        <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>Steps: {stepIndex}</span>
              <span>Array size: {displayArray.length}</span>
              <span>Speed: {speed}ms</span>
            </div>
            <span className="text-cyan-300">{algorithms.find((a) => a.key === algorithm)?.label}</span>
          </div>
          <div className="relative w-full aspect-[4/3] max-h-[28rem] overflow-hidden rounded-lg border border-slate-800 bg-[#0b1020] p-3">
            <div className="flex h-full items-end gap-[2px]">
              {displayArray.map((value, idx) => {
                const height = `${(value / maxValue) * 100}%`;
                const isActive = activeIndices.includes(idx);
                const color = colors[idx % colors.length];
                return (
                <div
                  key={idx}
                  className="flex-1 rounded-t transition-all duration-300"
                  style={{
                    height,
                    background: isComplete
                      ? "linear-gradient(180deg, #10b981, #059669)"
                      : isActive
                        ? "linear-gradient(180deg, #2de2e6, #ff2d95)"
                        : `linear-gradient(180deg, ${color}, #111827)`
                  }}
                  title={`${value}`}
                />
                  );
                })}
            </div>
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
              onClick={handlePauseToggle}
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
              min={10}
              max={200}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs text-slate-400">
              <span>Array size</span>
              <span className="text-slate-100">{size}</span>
            </label>
            <input
              type="range"
              min={10}
              max={90}
              value={size}
              onChange={(e) => {
                const next = Number(e.target.value);
                setSize(next);
                setBaseArray(generateArray(next));
              }}
              className="w-full accent-fuchsia-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortingVisualizer;
