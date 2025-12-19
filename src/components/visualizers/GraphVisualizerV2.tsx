import { ComplexityMeta } from "../../types/complexity";
import { AlgorithmStep, SearchStep } from "../../algorithms/graph/types";
import { useGraphVisualizerV2 } from "../../hooks/useGraphVisualizerV2";
import GraphControlsV2 from "../controls/GraphControlsV2";

type GraphVisualizerProps = {
  onComplexityChange?: (meta: ComplexityMeta) => void;
};

const complexityByAlgo = {
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
};

export default function GraphVisualizerV2({ onComplexityChange }: GraphVisualizerProps) {
  const {
    algorithm,
    setAlgorithm,
    graphType,
    setGraphType,
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
    compatibleGenerators,
    useTargetSearch,
    setUseTargetSearch,
    targetNode,
    setTargetNode,
    startNode,
    setStartNode,
    unifiedGraph
  } = useGraphVisualizerV2();

  onComplexityChange?.(complexityByAlgo[algorithm]);

  const getNodeColor = (nodeIndex: number) => {
    // Handle SearchStep (target-based BFS/DFS)
    if ('target' in currentStep) {
      const searchStep = currentStep as SearchStep;

      // Found node gets special color
      if (searchStep.type === 'found' && currentStep.node === nodeIndex) {
        return "#fbbf24"; // Amber for found
      }

      // Path nodes get highlighted
      if (searchStep.path?.includes(nodeIndex)) {
        return "#10b981"; // Green for path
      }

      // Visited nodes
      if (searchStep.visited.includes(nodeIndex)) {
        return "#10b981"; // Green
      }

      // Frontier nodes
      if (searchStep.frontier.includes(nodeIndex)) {
        return "#f59e0b"; // Orange
      }
    }
    // Handle GraphTraversalStep (legacy BFS/DFS)
    else if ('visited' in currentStep && 'frontier' in currentStep) {
      if ((currentStep as any).visited.includes(nodeIndex)) {
        return "#10b981"; // Green for visited
      }
      if ((currentStep as any).frontier.includes(nodeIndex)) {
        return "#f59e0b"; // Orange for frontier
      }
    }
    // Handle GraphStep (Prim's, Bellman-Ford, Topological)
    else {
      if (currentStep.node === nodeIndex && (currentStep as any).type === "visit") {
        return "#10b981"; // Green
      }
      if ((currentStep as any).distances && (currentStep as any).distances[nodeIndex] !== Infinity) {
        return "#3b82f6"; // Blue
      }
      if ((currentStep as any).order?.includes(nodeIndex)) {
        const orderIndex = (currentStep as any).order.indexOf(nodeIndex);
        // Different shades of purple based on order
        return `hsl(270, 70%, ${30 + (orderIndex * 50 / (currentStep as any).order.length)}%)`;
      }
    }
    return "#64748b"; // Slate default
  };

  const getEdgeStyle = (from: number, to: number) => {
    // Check for MST edges
    if ((currentStep as any).mstEdges?.some(([f, t]) => (f === from && t === to) || (f === to && t === from))) {
      return { stroke: "#10b981", strokeWidth: 3, opacity: 1 };
    }

    // Check for active edges (but don't animate for Bellman-Ford or Topological Sort)
    if ((currentStep as any).edges?.some(([f, t]) => (f === from && t === to) || (f === to && t === from)) && algorithm !== 'bellman' && algorithm !== 'topo') {
      return { stroke: "#f59e0b", strokeWidth: 3, opacity: 1 };
    }

    // Check for path edges in target search
    if ('path' in currentStep && (currentStep as SearchStep).path) {
      const path = (currentStep as SearchStep).path!;
      const pathIndex = path.indexOf(from);
      if (pathIndex !== -1 && pathIndex + 1 < path.length && path[pathIndex + 1] === to) {
        return { stroke: "#10b981", strokeWidth: 3, opacity: 1 };
      }
      const reverseIndex = path.indexOf(to);
      if (reverseIndex !== -1 && reverseIndex + 1 < path.length && path[reverseIndex + 1] === from) {
        return { stroke: "#10b981", strokeWidth: 3, opacity: 1 };
      }
    }

    // For directed graphs, make edges more visible
    return { stroke: "#475569", strokeWidth: 1, opacity: (algorithm === 'bellman' || algorithm === 'topo') ? 0.8 : 0.5 };
  };

  const getNodeLabel = (nodeIndex: number) => {
    // For search algorithms, show special labels
    if ('target' in currentStep) {
      const searchStep = currentStep as SearchStep;
      if (nodeIndex === searchStep.target) {
        return "T"; // Target
      }
      if (nodeIndex === startNode) {
        return "S"; // Start
      }
    }
    return nodeIndex.toString();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full bg-green-500/30 px-3 py-1 text-green-100">Graph</span>
        <div className="flex flex-wrap gap-2">
          {(["prim", "topo", "bellman", "bfs", "dfs"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setAlgorithm(key)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                algorithm === key
                  ? "border-green-400 bg-green-500/15 text-green-50"
                  : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600"
              }`}
            >
              {complexityByAlgo[key].name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Step: {stepIndex + 1} / {totalSteps}</span>
            <span>Nodes: {numNodes}</span>
            {(algorithm === 'bellman' || algorithm === 'topo') && (
              <span className="flex items-center gap-1">
                <span>Directed Graph</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2l-5 5h3v6h4V7h3z" transform="rotate(90 8 8)" />
                </svg>
              </span>
            )}
            {useTargetSearch && targetNode !== null && (
              <span>Search: {startNode} → {targetNode}</span>
            )}
          </div>

          {/* Search status */}
          {'target' in currentStep && (
            <div className="mb-2 text-xs">
              {(currentStep as SearchStep).type === 'found' && (
                <span className="text-amber-400">Target found! Path: {(currentStep as SearchStep).path?.join(' → ')}</span>
              )}
              {(currentStep as SearchStep).type === 'not_found' && (
                <span className="text-red-400">Target not reachable</span>
              )}
              {(currentStep as SearchStep).type === 'visit' && (
                <span className="text-cyan-400">Searching...</span>
              )}
            </div>
          )}

          <div className="relative w-full aspect-[4/3] max-h-[28rem] overflow-hidden rounded-lg border border-slate-800 bg-[#0b1020] p-3">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Define arrow markers */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="25"
                  refY="5"
                  orient="auto"
                  fill="#475569"
                >
                  <polygon points="0 0, 10 5, 0 10" />
                </marker>
                <marker
                  id="arrowhead-green"
                  markerWidth="10"
                  markerHeight="10"
                  refX="25"
                  refY="5"
                  orient="auto"
                  fill="#10b981"
                >
                  <polygon points="0 0, 10 5, 0 10" />
                </marker>
                <marker
                  id="arrowhead-orange"
                  markerWidth="10"
                  markerHeight="10"
                  refX="25"
                  refY="5"
                  orient="auto"
                  fill="#f59e0b"
                >
                  <polygon points="0 0, 10 5, 0 10" />
                </marker>
              </defs>

              {/* Edges */}
              {nodes.map((node, i) => {
                return node.edges.map((edge: any) => {
                  const isDirectedGraph = algorithm === 'bellman' || algorithm === 'topo';

                  // Skip invalid edges
                  if (edge.to === undefined || edge.to === null || edge.to < 0 || edge.to >= nodes.length) {
                    return null;
                  }

                  const edgeStyle = getEdgeStyle(i, edge.to);
                  const isHighlighted = edgeStyle.stroke === "#10b981" || edgeStyle.stroke === "#f59e0b";

                  // For undirected graphs, only show edge once
                  if (!isDirectedGraph && i >= edge.to) {
                    return null;
                  }

                  // Additional safety check
                  const targetNode = nodes[edge.to];
                  if (!targetNode) {
                    return null;
                  }

                  return (
                    <line
                      key={`${i}-${edge.to}`}
                      x1={node.x}
                      y1={node.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      {...edgeStyle}
                      markerEnd={
                        isDirectedGraph
                          ? isHighlighted
                            ? edgeStyle.stroke === "#10b981" ? "url(#arrowhead-green)" : "url(#arrowhead-orange)"
                            : "url(#arrowhead)"
                          : "none"
                      }
                    />
                  );
                });
              })}

              {/* Edge weights */}
              {nodes.map((node, i) => {
                return node.edges.map((edge: any) => {
                  const isDirectedGraph = algorithm === 'bellman' || algorithm === 'topo';

                  // Skip invalid edges
                  if (edge.to === undefined || edge.to === null || edge.to < 0 || edge.to >= nodes.length) {
                    return null;
                  }

                  const targetNode = nodes[edge.to];
                  if (!targetNode) {
                    return null;
                  }

                  // For undirected graphs, only show weight once
                  if (!isDirectedGraph && i >= edge.to) {
                    return null;
                  }

                  // Skip weights for topo sort
                  if (algorithm === "topo") {
                    return null;
                  }

                  const midX = (node.x + targetNode.x) / 2;
                  const midY = (node.y + targetNode.y) / 2;
                  const weightText = edge.weight.toString();

                  // Calculate text width approximation (rough estimate)
                  const textWidth = weightText.length * 7;
                  const textHeight = 16;

                  return (
                    <g key={`weight-${i}-${edge.to}`}>
                      {/* Background rectangle for better visibility */}
                      <rect
                        x={midX - textWidth / 2 - 2}
                        y={midY - textHeight / 2 - 1}
                        width={textWidth + 4}
                        height={textHeight}
                        fill="#0b1020"
                        stroke="#475569"
                        strokeWidth="1"
                        rx="2"
                        className="pointer-events-none"
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        fill="white"
                        fontSize="12"
                        textAnchor="middle"
                        className="pointer-events-none font-medium"
                      >
                        {weightText}
                      </text>
                    </g>
                  );
                });
              })}

              {/* Nodes */}
              {nodes.map((node, i) => (
                <g key={i}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill={getNodeColor(i)}
                    className="transition-all duration-300"
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {getNodeLabel(i)}
                  </text>
                </g>
              ))}

              {/* Display distances for Bellman-Ford */}
              {algorithm === "bellman" && (currentStep as any).distances && (
                <g className="pointer-events-none">
                  {(currentStep as any).distances.map((dist: number, i: number) => (
                    <text
                      key={`dist-${i}`}
                      x={nodes[i]?.x || 0}
                      y={(nodes[i]?.y || 0) - 30}
                      fill="white"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {dist === Infinity ? "∞" : dist}
                    </text>
                  ))}
                </g>
              )}
            </svg>
          </div>
        </div>

        <GraphControlsV2
          algorithm={algorithm}
          onAlgorithmChange={setAlgorithm}
          numNodes={numNodes}
          onNumNodesChange={setNumNodes}
          graphType={graphType}
          onGraphTypeChange={setGraphType}
          isPlaying={isPlaying}
          onPlay={play}
          onPause={pause}
          onStep={step}
          onReset={reset}
          onRegenerate={regenerate}
          speed={speed}
          onSpeedChange={setSpeed}
          compatibleGenerators={compatibleGenerators}
          useTargetSearch={useTargetSearch}
          setUseTargetSearch={setUseTargetSearch}
          targetNode={targetNode}
          setTargetNode={setTargetNode}
          startNode={startNode}
          setStartNode={setStartNode}
          numAvailableNodes={numNodes}
        />
      </div>
    </div>
  );
}