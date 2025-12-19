import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComplexityMeta } from "../../types/complexity";
import {
  MLAlgorithm,
  mlComplexity,
  KMeansStep,
  Point2D,
  LabeledPoint,
  LinearRegressionStep,
  KNNStep,
  DecisionTreeStep,
  LogisticRegressionStep,
} from "../../types/ml";
import { KMeansPoint, generatePoints, kmeansSteps } from "../../algorithms/ml/kmeans";
import { generateRegressionData, linearRegressionSteps } from "../../algorithms/ml/linearRegression";
import { generateClassificationData, knnSteps } from "../../algorithms/ml/knn";
import { decisionTreeSteps } from "../../algorithms/ml/decisionTree";
import { generateBinaryClassificationData, logisticRegressionSteps } from "../../algorithms/ml/logisticRegression";

const palette = ["#ff2d95", "#2de2e6", "#f8d210", "#3df29b", "#a855f7", "#fb7185"];

type MachineLearningVisualizerProps = {
  onComplexityChange?: (meta: ComplexityMeta) => void;
};

const algorithms: { id: MLAlgorithm; name: string }[] = [
  { id: "kmeans", name: "K-Means" },
  { id: "linear-regression", name: "Linear Regression" },
  { id: "knn", name: "KNN" },
  { id: "decision-tree", name: "Decision Tree" },
  { id: "logistic-regression", name: "Logistic Regression" },
];

// Helper to get click position as normalized coordinates
function getClickPosition(e: React.MouseEvent<HTMLDivElement>, containerRef: React.RefObject<HTMLDivElement>): Point2D | null {
  if (!containerRef.current) return null;
  const rect = containerRef.current.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  return { x: Math.max(0.02, Math.min(0.98, x)), y: Math.max(0.02, Math.min(0.98, y)) };
}

// Instructions component
function Instructions({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-2 text-xs text-slate-400">
      <span className="text-cyan-400">Tip:</span> {text}
    </div>
  );
}

// K-Means Content Component
function KMeansContent({ onComplexityChange }: { onComplexityChange?: (meta: ComplexityMeta) => void }) {
  const [points, setPoints] = useState<KMeansPoint[]>(() => generatePoints(60));
  const [clusters, setClusters] = useState(3);
  const [steps, setSteps] = useState<KMeansStep[]>([]);
  const [centroids, setCentroids] = useState<KMeansPoint[]>([]);
  const [assignments, setAssignments] = useState<number[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generator = kmeansSteps(points, clusters, 8);
    const all = Array.from(generator);
    setSteps(all);
    setCentroids(all[0]?.centroids ?? []);
    setAssignments(new Array(points.length).fill(-1));
    setStepIndex(0);
    setIsPlaying(false);
    onComplexityChange?.(mlComplexity["kmeans"]);
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

  const handleRegenerate = () => {
    setPoints(generatePoints(60));
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getClickPosition(e, canvasRef);
    if (pos) {
      setPoints((prev) => [...prev, pos]);
    }
  }, []);

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
    <div className="flex flex-col gap-3 md:flex-row flex-1 min-h-0">
      <div className="flex-1 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4 min-h-0">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Steps: {stepIndex}</span>
          <span>Points: {points.length} | k = {clusters}</span>
          <span>Speed: {speed}ms</span>
        </div>
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg border border-slate-800 bg-[#0b1020] cursor-crosshair"
        >
          {canvasPoints.map((p, idx) => (
            <div
              key={idx}
              className="absolute h-3 w-3 rounded-full border border-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.1)] pointer-events-none"
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                transform: "translate(-50%, -50%)",
                background: p.color,
              }}
            />
          ))}
          {centroids.map((c, idx) => (
            <div
              key={`c-${idx}`}
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] pointer-events-none"
              style={{
                left: `${c.x * 100}%`,
                top: `${c.y * 100}%`,
                background: palette[idx % palette.length],
              }}
            />
          ))}
        </div>
        <Instructions text="Click on the canvas to add points. The algorithm will cluster them automatically." />
      </div>

      <div className="w-full max-w-xs space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200 max-h-full overflow-y-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Controls</p>
        <div className="flex gap-2">
          <button type="button" onClick={isPlaying ? () => setIsPlaying(false) : handleRun} className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500">
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button type="button" onClick={stepForward} className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500">
            Step
          </button>
          <button type="button" onClick={handleRegenerate} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Regenerate
          </button>
        </div>
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Speed (ms)</span>
            <span className="text-cyan-400">{speed}</span>
          </label>
          <input type="range" min={50} max={800} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-cyan-500" />
        </div>
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Clusters (k)</span>
            <span className="text-slate-100">{clusters}</span>
          </label>
          <input type="range" min={2} max={6} value={clusters} onChange={(e) => setClusters(Number(e.target.value))} className="w-full accent-amber-400" />
        </div>
        <button
          type="button"
          onClick={() => setPoints([])}
          className="w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/50"
        >
          Clear All Points
        </button>
      </div>
    </div>
  );
}

// Linear Regression Content Component
function LinearRegressionContent({ onComplexityChange }: { onComplexityChange?: (meta: ComplexityMeta) => void }) {
  const [points, setPoints] = useState<Point2D[]>(() => generateRegressionData(50));
  const [steps, setSteps] = useState<LinearRegressionStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<LinearRegressionStep | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [learningRate, setLearningRate] = useState(0.5);
  const [iterations, setIterations] = useState(50);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generator = linearRegressionSteps(points, learningRate, iterations);
    const all = Array.from(generator);
    setSteps(all);
    setCurrentStep(all[0] || null);
    setStepIndex(0);
    setIsPlaying(false);
    onComplexityChange?.(mlComplexity["linear-regression"]);
  }, [points, learningRate, iterations]);

  useEffect(() => {
    if (!isPlaying || stepIndex >= steps.length) {
      if (stepIndex >= steps.length) setIsPlaying(false);
      return;
    }
    const id = window.setTimeout(() => stepForward(), speed);
    return () => window.clearTimeout(id);
  }, [isPlaying, stepIndex, steps, speed]);

  const stepForward = () => {
    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      return;
    }
    setCurrentStep(steps[stepIndex]);
    setStepIndex((i) => i + 1);
  };

  const handleRun = () => {
    setStepIndex(0);
    setCurrentStep(steps[0] || null);
    setIsPlaying(true);
  };

  const handleRegenerate = () => {
    setPoints(generateRegressionData(50));
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getClickPosition(e, canvasRef);
    if (pos) {
      // Invert y for regression (y increases upward in data space)
      setPoints((prev) => [...prev, { x: pos.x, y: 1 - pos.y }]);
    }
  }, []);

  const slope = currentStep && currentStep.type !== 'init' ? currentStep.slope : (currentStep?.slope ?? 0);
  const intercept = currentStep && currentStep.type !== 'init' ? currentStep.intercept : (currentStep?.intercept ?? 0.5);
  const loss = currentStep && currentStep.type === 'gradient' ? currentStep.loss : (currentStep?.type === 'done' ? currentStep.loss : null);
  const r2 = currentStep?.type === 'done' ? currentStep.r2 : null;

  return (
    <div className="flex flex-col gap-3 md:flex-row flex-1 min-h-0">
      <div className="flex-1 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4 min-h-0">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Iteration: {currentStep?.type === 'gradient' ? currentStep.iteration : (currentStep?.type === 'done' ? iterations : 0)}</span>
          <span>Loss: {loss?.toFixed(4) ?? "—"}</span>
          <span>{r2 !== null ? `R² = ${r2.toFixed(4)}` : `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`}</span>
        </div>
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg border border-slate-800 bg-[#0b1020] cursor-crosshair"
        >
          {/* Regression line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <line
              x1="0%"
              y1={`${(1 - intercept) * 100}%`}
              x2="100%"
              y2={`${(1 - (slope + intercept)) * 100}%`}
              stroke="#22d3ee"
              strokeWidth="2"
              opacity="0.8"
            />
          </svg>
          {/* Data points */}
          {points.map((p, idx) => (
            <div
              key={idx}
              className="absolute h-3 w-3 rounded-full border border-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.1)] pointer-events-none"
              style={{
                left: `${p.x * 100}%`,
                top: `${(1 - p.y) * 100}%`,
                transform: "translate(-50%, -50%)",
                background: "#f8d210",
              }}
            />
          ))}
        </div>
        <Instructions text="Click on the canvas to add data points. Watch the regression line fit to your data." />
      </div>

      <div className="w-full max-w-xs space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200 max-h-full overflow-y-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Controls</p>
        <div className="flex gap-2">
          <button type="button" onClick={isPlaying ? () => setIsPlaying(false) : handleRun} className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500">
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button type="button" onClick={stepForward} className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500">
            Step
          </button>
          <button type="button" onClick={handleRegenerate} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Regenerate
          </button>
        </div>
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Speed (ms)</span>
            <span className="text-cyan-400">{speed}</span>
          </label>
          <input type="range" min={50} max={800} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-cyan-500" />
        </div>
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Learning Rate</span>
            <span className="text-slate-100">{learningRate.toFixed(2)}</span>
          </label>
          <input type="range" min={0.1} max={1} step={0.1} value={learningRate} onChange={(e) => setLearningRate(Number(e.target.value))} className="w-full accent-fuchsia-400" />
        </div>
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Iterations</span>
            <span className="text-slate-100">{iterations}</span>
          </label>
          <input type="range" min={10} max={100} value={iterations} onChange={(e) => setIterations(Number(e.target.value))} className="w-full accent-amber-400" />
        </div>
        <button
          type="button"
          onClick={() => setPoints([])}
          className="w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/50"
        >
          Clear All Points
        </button>
      </div>
    </div>
  );
}

// KNN Content Component
function KNNContent({ onComplexityChange }: { onComplexityChange?: (meta: ComplexityMeta) => void }) {
  const [data, setData] = useState<LabeledPoint[]>(() => generateClassificationData(60, 2));
  const [queryPoint, setQueryPoint] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [k, setK] = useState(3);
  const [steps, setSteps] = useState<KNNStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<KNNStep | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [neighbors, setNeighbors] = useState<LabeledPoint[]>([]);
  const [distances, setDistances] = useState<number[]>([]);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState(0);
  const [isMovingQuery, setIsMovingQuery] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generator = knnSteps(data, queryPoint, k);
    const all = Array.from(generator);
    setSteps(all);
    setCurrentStep(all[0] || null);
    setStepIndex(0);
    setIsPlaying(false);
    setNeighbors([]);
    setDistances([]);
    setPrediction(null);
    onComplexityChange?.(mlComplexity["knn"]);
  }, [data, queryPoint, k]);

  useEffect(() => {
    if (!isPlaying || stepIndex >= steps.length) {
      if (stepIndex >= steps.length) setIsPlaying(false);
      return;
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
    setCurrentStep(step);

    if (step.type === 'distances') {
      setNeighbors(step.neighbors);
      setDistances(step.distances);
    } else if (step.type === 'vote' || step.type === 'done') {
      setPrediction(step.prediction);
    }

    setStepIndex((i) => i + 1);
  };

  const handleRun = () => {
    setStepIndex(0);
    setCurrentStep(steps[0] || null);
    setNeighbors([]);
    setDistances([]);
    setPrediction(null);
    setIsPlaying(true);
  };

  const handleRegenerate = () => {
    setData(generateClassificationData(60, 2));
    setQueryPoint({ x: Math.random() * 0.6 + 0.2, y: Math.random() * 0.6 + 0.2 });
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getClickPosition(e, canvasRef);
    if (pos) {
      if (isMovingQuery) {
        setQueryPoint(pos);
      } else {
        setData((prev) => [...prev, { ...pos, label: selectedClass }]);
      }
    }
  }, [isMovingQuery, selectedClass]);

  const maxDist = distances.length > 0 ? Math.max(...distances) : 0;

  return (
    <div className="flex flex-col gap-3 md:flex-row flex-1 min-h-0">
      <div className="flex-1 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4 min-h-0">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Step: {stepIndex}/{steps.length}</span>
          <span>k = {k} | Points: {data.length}</span>
          <span>{prediction !== null ? `Prediction: Class ${prediction}` : "—"}</span>
        </div>
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg border border-slate-800 bg-[#0b1020] cursor-crosshair"
        >
          {/* Distance circle */}
          {maxDist > 0 && (
            <div
              className="absolute rounded-full border-2 border-cyan-400/40 pointer-events-none"
              style={{
                left: `${queryPoint.x * 100}%`,
                top: `${queryPoint.y * 100}%`,
                width: `${maxDist * 200}%`,
                height: `${maxDist * 200}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
          {/* Data points */}
          {data.map((p, idx) => {
            const isNeighbor = neighbors.some((n) => n.x === p.x && n.y === p.y);
            return (
              <div
                key={idx}
                className={`absolute rounded-full border shadow-[0_0_8px_rgba(255,255,255,0.1)] pointer-events-none ${isNeighbor ? "h-4 w-4 border-2 border-white" : "h-3 w-3 border-slate-950"}`}
                style={{
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  background: palette[p.label % palette.length],
                }}
              />
            );
          })}
          {/* Query point */}
          <div
            className="absolute h-5 w-5 rounded-full border-2 border-white shadow-[0_0_16px_rgba(255,255,255,0.6)] pointer-events-none"
            style={{
              left: `${queryPoint.x * 100}%`,
              top: `${queryPoint.y * 100}%`,
              transform: "translate(-50%, -50%)",
              background: prediction !== null ? palette[prediction % palette.length] : "#94a3b8",
            }}
          >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-white font-bold">?</span>
          </div>
        </div>
        <Instructions text={isMovingQuery ? "Click to move the query point (?). Toggle mode below to add training points." : `Click to add Class ${selectedClass} points. Toggle mode to move the query point.`} />
      </div>

      <div className="w-full max-w-xs space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200 max-h-full overflow-y-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Controls</p>
        <div className="flex gap-2">
          <button type="button" onClick={isPlaying ? () => setIsPlaying(false) : handleRun} className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500">
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button type="button" onClick={stepForward} className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500">
            Step
          </button>
          <button type="button" onClick={handleRegenerate} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Regenerate
          </button>
        </div>

        {/* Click mode toggle */}
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Click Mode</span>
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setIsMovingQuery(true)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${isMovingQuery ? "bg-cyan-500/20 border border-cyan-400 text-cyan-200" : "border border-slate-700 text-slate-400"}`}
            >
              Move Query
            </button>
            <button
              type="button"
              onClick={() => setIsMovingQuery(false)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${!isMovingQuery ? "bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200" : "border border-slate-700 text-slate-400"}`}
            >
              Add Points
            </button>
          </div>
        </div>

        {/* Class selector (when adding points) */}
        {!isMovingQuery && (
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs text-slate-400">
              <span>Select Class</span>
            </label>
            <div className="flex gap-1">
              {[0, 1].map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${selectedClass === cls ? "border-2" : "border border-slate-700"}`}
                  style={{
                    borderColor: selectedClass === cls ? palette[cls] : undefined,
                    backgroundColor: selectedClass === cls ? `${palette[cls]}20` : undefined,
                    color: selectedClass === cls ? palette[cls] : undefined,
                  }}
                >
                  Class {cls}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Speed (ms)</span>
            <span className="text-cyan-400">{speed}</span>
          </label>
          <input type="range" min={50} max={800} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-cyan-500" />
        </div>
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>K Neighbors</span>
            <span className="text-slate-100">{k}</span>
          </label>
          <input type="range" min={1} max={15} value={k} onChange={(e) => setK(Number(e.target.value))} className="w-full accent-fuchsia-400" />
        </div>
      </div>
    </div>
  );
}

// Decision Tree Content Component
function DecisionTreeContent({ onComplexityChange }: { onComplexityChange?: (meta: ComplexityMeta) => void }) {
  const [data, setData] = useState<LabeledPoint[]>(() => generateClassificationData(80, 2, 0.35));
  const [steps, setSteps] = useState<DecisionTreeStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<DecisionTreeStep | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [maxDepth, setMaxDepth] = useState(4);
  const [regions, setRegions] = useState<{ bounds: [number, number, number, number]; label: number }[]>([]);
  const [selectedClass, setSelectedClass] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generator = decisionTreeSteps(data, maxDepth, 3);
    const all = Array.from(generator);
    setSteps(all);
    setCurrentStep(all[0] || null);
    setStepIndex(0);
    setIsPlaying(false);
    setRegions([]);
    onComplexityChange?.(mlComplexity["decision-tree"]);
  }, [data, maxDepth]);

  useEffect(() => {
    if (!isPlaying || stepIndex >= steps.length) {
      if (stepIndex >= steps.length) setIsPlaying(false);
      return;
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
    setCurrentStep(step);

    if (step.type === 'partition') {
      setRegions(step.regions);
    } else if (step.type === 'done') {
      setRegions(step.regions);
    }

    setStepIndex((i) => i + 1);
  };

  const handleRun = () => {
    setStepIndex(0);
    setCurrentStep(steps[0] || null);
    setRegions([]);
    setIsPlaying(true);
  };

  const handleRegenerate = () => {
    setData(generateClassificationData(80, 2, 0.35));
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getClickPosition(e, canvasRef);
    if (pos) {
      setData((prev) => [...prev, { ...pos, label: selectedClass }]);
    }
  }, [selectedClass]);

  const accuracy = currentStep?.type === 'done' ? currentStep.accuracy : null;

  return (
    <div className="flex flex-col gap-3 md:flex-row flex-1 min-h-0">
      <div className="flex-1 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4 min-h-0">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Step: {stepIndex}/{steps.length}</span>
          <span>Depth: {maxDepth} | Points: {data.length}</span>
          <span>{accuracy !== null ? `Accuracy: ${(accuracy * 100).toFixed(1)}%` : "—"}</span>
        </div>
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg border border-slate-800 bg-[#0b1020] cursor-crosshair"
        >
          {/* Decision regions */}
          {regions.map((region, idx) => (
            <div
              key={idx}
              className="absolute pointer-events-none"
              style={{
                left: `${region.bounds[0] * 100}%`,
                top: `${region.bounds[1] * 100}%`,
                width: `${(region.bounds[2] - region.bounds[0]) * 100}%`,
                height: `${(region.bounds[3] - region.bounds[1]) * 100}%`,
                background: `${palette[region.label % palette.length]}20`,
                borderRight: "1px solid rgba(255,255,255,0.1)",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          ))}
          {/* Data points */}
          {data.map((p, idx) => (
            <div
              key={idx}
              className="absolute h-3 w-3 rounded-full border border-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.1)] pointer-events-none"
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                transform: "translate(-50%, -50%)",
                background: palette[p.label % palette.length],
              }}
            />
          ))}
        </div>
        <Instructions text={`Click to add Class ${selectedClass} points. Use the class selector to switch between classes.`} />
      </div>

      <div className="w-full max-w-xs space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200 max-h-full overflow-y-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Controls</p>
        <div className="flex gap-2">
          <button type="button" onClick={isPlaying ? () => setIsPlaying(false) : handleRun} className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500">
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button type="button" onClick={stepForward} className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500">
            Step
          </button>
          <button type="button" onClick={handleRegenerate} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Regenerate
          </button>
        </div>

        {/* Class selector */}
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Select Class to Add</span>
          </label>
          <div className="flex gap-1">
            {[0, 1].map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${selectedClass === cls ? "border-2" : "border border-slate-700"}`}
                style={{
                  borderColor: selectedClass === cls ? palette[cls] : undefined,
                  backgroundColor: selectedClass === cls ? `${palette[cls]}20` : undefined,
                  color: selectedClass === cls ? palette[cls] : undefined,
                }}
              >
                Class {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Speed (ms)</span>
            <span className="text-cyan-400">{speed}</span>
          </label>
          <input type="range" min={50} max={800} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-cyan-500" />
        </div>
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Max Depth</span>
            <span className="text-slate-100">{maxDepth}</span>
          </label>
          <input type="range" min={1} max={8} value={maxDepth} onChange={(e) => setMaxDepth(Number(e.target.value))} className="w-full accent-fuchsia-400" />
        </div>
        <button
          type="button"
          onClick={() => setData([])}
          className="w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/50"
        >
          Clear All Points
        </button>
      </div>
    </div>
  );
}

// Logistic Regression Content Component
function LogisticRegressionContent({ onComplexityChange }: { onComplexityChange?: (meta: ComplexityMeta) => void }) {
  const [data, setData] = useState<LabeledPoint[]>(() => generateBinaryClassificationData(80));
  const [steps, setSteps] = useState<LogisticRegressionStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<LogisticRegressionStep | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [learningRate, setLearningRate] = useState(0.5);
  const [iterations, setIterations] = useState(60);
  const [selectedClass, setSelectedClass] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generator = logisticRegressionSteps(data, learningRate, iterations);
    const all = Array.from(generator);
    setSteps(all);
    setCurrentStep(all[0] || null);
    setStepIndex(0);
    setIsPlaying(false);
    onComplexityChange?.(mlComplexity["logistic-regression"]);
  }, [data, learningRate, iterations]);

  useEffect(() => {
    if (!isPlaying || stepIndex >= steps.length) {
      if (stepIndex >= steps.length) setIsPlaying(false);
      return;
    }
    const id = window.setTimeout(() => stepForward(), speed);
    return () => window.clearTimeout(id);
  }, [isPlaying, stepIndex, steps, speed]);

  const stepForward = () => {
    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      return;
    }
    setCurrentStep(steps[stepIndex]);
    setStepIndex((i) => i + 1);
  };

  const handleRun = () => {
    setStepIndex(0);
    setCurrentStep(steps[0] || null);
    setIsPlaying(true);
  };

  const handleRegenerate = () => {
    setData(generateBinaryClassificationData(80));
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getClickPosition(e, canvasRef);
    if (pos) {
      setData((prev) => [...prev, { ...pos, label: selectedClass }]);
    }
  }, [selectedClass]);

  const weights = currentStep?.weights ?? [0, 0];
  const bias = currentStep?.bias ?? 0;
  const loss = currentStep?.type === 'gradient' ? currentStep.loss : null;
  const accuracy = currentStep?.type === 'done' ? currentStep.accuracy : null;

  // Calculate decision boundary line: w0*x + w1*y + b = 0
  // y = (-w0*x - b) / w1
  const getDecisionBoundaryY = (x: number): number => {
    if (weights[1] === 0) return 0.5;
    return (-weights[0] * x - bias) / weights[1];
  };

  const y0 = getDecisionBoundaryY(0);
  const y1 = getDecisionBoundaryY(1);

  return (
    <div className="flex flex-col gap-3 md:flex-row flex-1 min-h-0">
      <div className="flex-1 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4 min-h-0">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Iteration: {currentStep?.type === 'gradient' ? currentStep.iteration : (currentStep?.type === 'done' ? iterations : 0)}</span>
          <span>Loss: {loss?.toFixed(4) ?? "—"}</span>
          <span>{accuracy !== null ? `Accuracy: ${(accuracy * 100).toFixed(1)}%` : `Points: ${data.length}`}</span>
        </div>
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg border border-slate-800 bg-[#0b1020] cursor-crosshair"
        >
          {/* Decision boundary line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <line
              x1="0%"
              y1={`${y0 * 100}%`}
              x2="100%"
              y2={`${y1 * 100}%`}
              stroke="#d946ef"
              strokeWidth="2"
              opacity="0.8"
            />
          </svg>
          {/* Data points */}
          {data.map((p, idx) => (
            <div
              key={idx}
              className="absolute h-3 w-3 rounded-full border border-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.1)] pointer-events-none"
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                transform: "translate(-50%, -50%)",
                background: palette[p.label % palette.length],
              }}
            />
          ))}
        </div>
        <Instructions text={`Click to add Class ${selectedClass} points. Use the class selector to switch between classes.`} />
      </div>

      <div className="w-full max-w-xs space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-200 max-h-full overflow-y-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Controls</p>
        <div className="flex gap-2">
          <button type="button" onClick={isPlaying ? () => setIsPlaying(false) : handleRun} className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500">
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button type="button" onClick={stepForward} className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500">
            Step
          </button>
          <button type="button" onClick={handleRegenerate} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Regenerate
          </button>
        </div>

        {/* Class selector */}
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Select Class to Add</span>
          </label>
          <div className="flex gap-1">
            {[0, 1].map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${selectedClass === cls ? "border-2" : "border border-slate-700"}`}
                style={{
                  borderColor: selectedClass === cls ? palette[cls] : undefined,
                  backgroundColor: selectedClass === cls ? `${palette[cls]}20` : undefined,
                  color: selectedClass === cls ? palette[cls] : undefined,
                }}
              >
                Class {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Speed (ms)</span>
            <span className="text-cyan-400">{speed}</span>
          </label>
          <input type="range" min={50} max={800} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-cyan-500" />
        </div>
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Learning Rate</span>
            <span className="text-slate-100">{learningRate.toFixed(2)}</span>
          </label>
          <input type="range" min={0.1} max={1} step={0.1} value={learningRate} onChange={(e) => setLearningRate(Number(e.target.value))} className="w-full accent-fuchsia-400" />
        </div>
        <div className="space-y-1">
          <label className="flex items-center justify-between text-xs text-slate-400">
            <span>Iterations</span>
            <span className="text-slate-100">{iterations}</span>
          </label>
          <input type="range" min={20} max={120} value={iterations} onChange={(e) => setIterations(Number(e.target.value))} className="w-full accent-amber-400" />
        </div>
        <button
          type="button"
          onClick={() => setData([])}
          className="w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/50"
        >
          Clear All Points
        </button>
      </div>
    </div>
  );
}

// Main MachineLearningVisualizer Component
export default function MachineLearningVisualizer({ onComplexityChange }: MachineLearningVisualizerProps) {
  const [activeAlgorithm, setActiveAlgorithm] = useState<MLAlgorithm>("kmeans");

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Algorithm Selector */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full bg-amber-400/30 px-3 py-1 text-amber-100">Machine Learning</span>
        <div className="flex flex-wrap gap-2">
          {algorithms.map((algo) => (
            <button
              key={algo.id}
              type="button"
              onClick={() => setActiveAlgorithm(algo.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                activeAlgorithm === algo.id
                  ? "border border-amber-400 bg-amber-500/15 text-amber-50"
                  : "border border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              }`}
            >
              {algo.name}
            </button>
          ))}
        </div>
      </div>

      {/* Render active algorithm visualizer */}
      {activeAlgorithm === "kmeans" && <KMeansContent onComplexityChange={onComplexityChange} />}
      {activeAlgorithm === "linear-regression" && <LinearRegressionContent onComplexityChange={onComplexityChange} />}
      {activeAlgorithm === "knn" && <KNNContent onComplexityChange={onComplexityChange} />}
      {activeAlgorithm === "decision-tree" && <DecisionTreeContent onComplexityChange={onComplexityChange} />}
      {activeAlgorithm === "logistic-regression" && <LogisticRegressionContent onComplexityChange={onComplexityChange} />}
    </div>
  );
}
