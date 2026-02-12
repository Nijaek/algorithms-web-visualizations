"use client";

import { useEffect } from "react";
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
import { SearchStep } from "@/algorithms/graph/types";
import { useGraphVisualizerV2 } from "@/hooks/useGraphVisualizerV2";
import { checkCompatibility } from "@/algorithms/graph/utils/requirements";

// Map URL slugs to hook's internal algorithm keys
const slugToKey: Record<string, "prim" | "topo" | "bellman" | "bfs" | "dfs"> = {
  "prim-mst": "prim",
  "topological-sort": "topo",
  "bellman-ford": "bellman",
  "bfs-graph": "bfs",
  "dfs-graph": "dfs",
};

const keyToSlug: Record<string, string> = {
  prim: "prim-mst",
  topo: "topological-sort",
  bellman: "bellman-ford",
  bfs: "bfs-graph",
  dfs: "dfs-graph",
};

const graphAlgorithms = getAlgorithmsForCategory("graph").map((a) => ({
  key: a.id,
  label: a.name,
}));

interface GraphVisualizerClientProps {
  initialAlgorithm: string;
}

export default function GraphVisualizerClient({
  initialAlgorithm,
}: GraphVisualizerClientProps) {
  const router = useRouter();
  const { setComplexity } = useAlgorithm();

  const {
    algorithm,
    setAlgorithm,
    graphType,
    numNodes,
    setNumNodes,
    nodes,
    currentStep,
    stepIndex,
    totalSteps,
    isPlaying,
    speed,
    setSpeed,
    play,
    pause,
    step,
    reset,
    regenerate,
    useTargetSearch,
    setUseTargetSearch,
    targetNode,
    setTargetNode,
    startNode,
    setStartNode,
  } = useGraphVisualizerV2();

  // Sync URL algorithm to hook on mount
  useEffect(() => {
    const hookKey = slugToKey[initialAlgorithm];
    if (hookKey && hookKey !== algorithm) {
      setAlgorithm(hookKey);
    }
  }, [initialAlgorithm]);

  // Update complexity in context
  useEffect(() => {
    const slug = keyToSlug[algorithm] || initialAlgorithm;
    const entry = getAlgorithm(slug);
    if (entry) setComplexity(entry.complexity);
  }, [algorithm, setComplexity, initialAlgorithm]);

  const handleAlgorithmChange = (slug: string) => {
    const hookKey = slugToKey[slug];
    if (hookKey) setAlgorithm(hookKey);
    router.push(`/graph/${slug}`, { scroll: false });
  };

  const { compatible } = checkCompatibility(
    algorithm === "prim" ? "prim-mst" :
    algorithm === "topo" ? "topological-sort" :
    algorithm === "bellman" ? "bellman-ford" : algorithm,
    graphType
  );

  const isTraversalAlgorithm = algorithm === "bfs" || algorithm === "dfs";
  const isDirectedGraph = algorithm === "bellman" || algorithm === "topo";

  const getNodeColor = (nodeIndex: number) => {
    if ("target" in currentStep) {
      const searchStep = currentStep as SearchStep;
      if (searchStep.type === "found" && currentStep.node === nodeIndex) return "#fbbf24";
      if (searchStep.path?.includes(nodeIndex)) return "#10b981";
      if (searchStep.visited.includes(nodeIndex)) return "#10b981";
      if (searchStep.frontier.includes(nodeIndex)) return "#f59e0b";
    } else if ("visited" in currentStep && "frontier" in currentStep) {
      if ((currentStep as any).visited.includes(nodeIndex)) return "#10b981";
      if ((currentStep as any).frontier.includes(nodeIndex)) return "#f59e0b";
    } else {
      if (currentStep.node === nodeIndex && (currentStep as any).type === "visit") return "#10b981";
      if ((currentStep as any).distances?.[nodeIndex] !== undefined && (currentStep as any).distances[nodeIndex] !== Infinity) return "#3b82f6";
      if ((currentStep as any).order?.includes(nodeIndex)) {
        const orderIndex = (currentStep as any).order.indexOf(nodeIndex);
        return `hsl(270, 70%, ${30 + (orderIndex * 50 / (currentStep as any).order.length)}%)`;
      }
    }
    return "#64748b";
  };

  const getEdgeStyle = (from: number, to: number) => {
    if ((currentStep as any).mstEdges?.some(([f, t]: [number, number]) => (f === from && t === to) || (f === to && t === from)))
      return { stroke: "#10b981", strokeWidth: 3, opacity: 1 };
    if ((currentStep as any).edges?.some(([f, t]: [number, number]) => (f === from && t === to) || (f === to && t === from)) && algorithm !== "bellman" && algorithm !== "topo")
      return { stroke: "#f59e0b", strokeWidth: 3, opacity: 1 };
    if ("path" in currentStep && (currentStep as SearchStep).path) {
      const path = (currentStep as SearchStep).path!;
      const pi = path.indexOf(from);
      if (pi !== -1 && pi + 1 < path.length && path[pi + 1] === to) return { stroke: "#10b981", strokeWidth: 3, opacity: 1 };
      const ri = path.indexOf(to);
      if (ri !== -1 && ri + 1 < path.length && path[ri + 1] === from) return { stroke: "#10b981", strokeWidth: 3, opacity: 1 };
    }
    return { stroke: "#475569", strokeWidth: 1, opacity: isDirectedGraph ? 0.8 : 0.5 };
  };

  const getNodeLabel = (nodeIndex: number) => {
    if ("target" in currentStep) {
      if (nodeIndex === (currentStep as SearchStep).target) return "T";
      if (nodeIndex === startNode) return "S";
    }
    return nodeIndex.toString();
  };

  const currentSlug = keyToSlug[algorithm] || initialAlgorithm;

  return (
    <VisualizerLayout
      badge="Graph"
      badgeColor="green"
      pills={
        <AlgorithmPills
          algorithms={graphAlgorithms}
          active={currentSlug}
          onChange={handleAlgorithmChange}
          accentColor="green"
        />
      }
      infoBar={
        <StepCounter
          items={[
            { label: "Step", value: `${stepIndex + 1} / ${totalSteps}` },
            { label: "Nodes", value: numNodes },
            ...(isDirectedGraph ? [{ label: "Type", value: "Directed" }] : []),
          ]}
        />
      }
      controls={
        <ControlPanel title="Controls">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlay={play}
            onPause={pause}
            onStep={step}
            onReset={reset}
            canStep={compatible && !isPlaying}
            canReset={true}
            totalSteps={totalSteps}
            currentStep={stepIndex}
          />
          <RangeSlider label="Nodes" value={numNodes} onChange={setNumNodes} min={5} max={12} />
          <SpeedSlider value={speed} onChange={setSpeed} min={50} max={800} />

          {isTraversalAlgorithm && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Search Options</p>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">Start Node</label>
                <select
                  value={startNode}
                  onChange={(e) => setStartNode(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-sm"
                >
                  {Array.from({ length: numNodes }, (_, i) => (
                    <option key={i} value={i}>Node {i}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">Target Node</label>
                <select
                  value={targetNode ?? ""}
                  onChange={(e) => setTargetNode(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-sm"
                >
                  {Array.from({ length: numNodes }, (_, i) => (
                    <option key={i} value={i}>Node {i}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={regenerate}
            className="w-full rounded-lg bg-indigo-600/90 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Regenerate
          </button>
        </ControlPanel>
      }
    >
      <VisualizationCanvas>
        {"target" in currentStep && (
          <div className="absolute top-2 left-3 text-xs z-10">
            {(currentStep as SearchStep).type === "found" && (
              <span className="text-amber-400">Target found! Path: {(currentStep as SearchStep).path?.join(" → ")}</span>
            )}
            {(currentStep as SearchStep).type === "not_found" && (
              <span className="text-red-400">Target not reachable</span>
            )}
            {(currentStep as SearchStep).type === "visit" && (
              <span className="text-cyan-400">Searching...</span>
            )}
          </div>
        )}
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="25" refY="5" orient="auto" fill="#475569"><polygon points="0 0, 10 5, 0 10" /></marker>
            <marker id="arrowhead-green" markerWidth="10" markerHeight="10" refX="25" refY="5" orient="auto" fill="#10b981"><polygon points="0 0, 10 5, 0 10" /></marker>
            <marker id="arrowhead-orange" markerWidth="10" markerHeight="10" refX="25" refY="5" orient="auto" fill="#f59e0b"><polygon points="0 0, 10 5, 0 10" /></marker>
          </defs>

          {nodes.map((node, i) =>
            node.edges.map((edge: any) => {
              if (edge.to == null || edge.to < 0 || edge.to >= nodes.length) return null;
              const edgeStyle = getEdgeStyle(i, edge.to);
              const isHighlighted = edgeStyle.stroke === "#10b981" || edgeStyle.stroke === "#f59e0b";
              if (!isDirectedGraph && i >= edge.to) return null;
              const target = nodes[edge.to];
              if (!target) return null;
              return (
                <line key={`${i}-${edge.to}`} x1={node.x} y1={node.y} x2={target.x} y2={target.y} {...edgeStyle}
                  markerEnd={isDirectedGraph ? (isHighlighted ? (edgeStyle.stroke === "#10b981" ? "url(#arrowhead-green)" : "url(#arrowhead-orange)") : "url(#arrowhead)") : "none"} />
              );
            })
          )}

          {nodes.map((node, i) =>
            node.edges.map((edge: any) => {
              if (edge.to == null || edge.to < 0 || edge.to >= nodes.length) return null;
              if (!isDirectedGraph && i >= edge.to) return null;
              if (algorithm === "topo") return null;
              const target = nodes[edge.to];
              if (!target) return null;
              const midX = (node.x + target.x) / 2;
              const midY = (node.y + target.y) / 2;
              const w = String(edge.weight);
              return (
                <g key={`w-${i}-${edge.to}`}>
                  <rect x={midX - w.length * 3.5 - 2} y={midY - 9} width={w.length * 7 + 4} height={16} fill="#0b1020" stroke="#475569" strokeWidth="1" rx="2" className="pointer-events-none" />
                  <text x={midX} y={midY + 4} fill="white" fontSize="12" textAnchor="middle" className="pointer-events-none font-medium">{w}</text>
                </g>
              );
            })
          )}

          {nodes.map((node, i) => (
            <g key={i}>
              <circle cx={node.x} cy={node.y} r="20" fill={getNodeColor(i)} className="transition-all duration-300" />
              <text x={node.x} y={node.y + 5} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">{getNodeLabel(i)}</text>
            </g>
          ))}

          {algorithm === "bellman" && (currentStep as any).distances && (
            <g className="pointer-events-none">
              {(currentStep as any).distances.map((dist: number, i: number) => (
                <text key={`d-${i}`} x={nodes[i]?.x || 0} y={(nodes[i]?.y || 0) - 30} fill="white" fontSize="10" textAnchor="middle">
                  {dist === Infinity ? "∞" : dist}
                </text>
              ))}
            </g>
          )}
        </svg>
      </VisualizationCanvas>
    </VisualizerLayout>
  );
}
