import { useState, useEffect, useMemo } from "react";
import {
  Graph,
  AlgorithmStep,
  SearchStep,
  GraphGenerator,
  AlgorithmGenerator,
  GraphGeneratorType
} from "../algorithms/graph/types";
import { generateGraph } from "../algorithms/graph/generators";
import { checkCompatibility, getCompatibleGenerators } from "../algorithms/graph/utils/requirements";
import { legacyNodesToGraph, graphToLegacyNodes } from "../algorithms/graph/utils/adapters";
import { primMSTSteps } from "../algorithms/graph/primMST";
import { topologicalSortSteps } from "../algorithms/graph/topologicalSort";
import { bellmanFordSteps } from "../algorithms/graph/bellmanFord";
import { graphBFSSteps } from "../algorithms/graph/graphBFS";
import { graphDFSSteps } from "../algorithms/graph/graphDFS";
import { bfsSearch } from "../algorithms/graph/traversal/bfsSearch";
import { dfsSearch } from "../algorithms/graph/traversal/dfsSearch";

// Legacy interfaces for backward compatibility
interface LegacyGraphNode {
  x: number;
  y: number;
  label: string;
  edges: Array<{ to: number; weight: number }>;
  outgoing: number[];
  incoming: number[];
}

export function useGraphVisualizerV2() {
  const [algorithm, setAlgorithm] = useState<"prim" | "topo" | "bellman" | "bfs" | "dfs">("prim");
  const [numNodes, setNumNodes] = useState(8);
  const [useTargetSearch, setUseTargetSearch] = useState(false);
  const [targetNode, setTargetNode] = useState<number | null>(null);
  const [startNode, setStartNode] = useState(0);

  // Auto-enable target search for traversal algorithms
  useEffect(() => {
    if (algorithm === 'bfs' || algorithm === 'dfs') {
      setUseTargetSearch(true);
      // Set random target node (different from start node)
      let randomTarget;
      do {
        randomTarget = Math.floor(Math.random() * numNodes);
      } while (randomTarget === 0);
      setTargetNode(randomTarget);
      setStartNode(0);
    } else {
      setUseTargetSearch(false);
      setTargetNode(null);
    }
  }, [algorithm, numNodes]);

  // Auto-select graph type based on algorithm
  const getOptimalGraphType = (algo: string): GraphGeneratorType => {
    switch (algo) {
      case 'prim':
        return 'weighted-random'; // Weighted, connected, undirected
      case 'topo':
        return 'dag'; // Must be a DAG
      case 'bellman':
        return 'weighted-random'; // Weighted, directed
      case 'bfs':
      case 'dfs':
        return 'tree'; // Simple, clear structure for traversal
      default:
        return 'complete';
    }
  };

  const [graphType, setGraphType] = useState<GraphGeneratorType>(getOptimalGraphType("prim"));
  const [regenerateTrigger, setRegenerateTrigger] = useState(0);

  // Update graph type when algorithm changes
  useEffect(() => {
    setGraphType(getOptimalGraphType(algorithm));
  }, [algorithm]);

  // Generate unified graph
  const unifiedGraph = useMemo(() => {
    const generatorParams: GraphGenerator = {
      type: graphType,
      numNodes,
      weighted: true, // Most algorithms need weights
      directed: algorithm === 'topo' || algorithm === 'bellman'
    };

    let graph = generateGraph(generatorParams);

    // Special handling for Bellman-Ford only: ensure edges are truly directed and each node has outgoing edges
    if (algorithm === 'bellman' && graphType === 'weighted-random') {
      const directedEdges: any[] = [];
      const edgeSet = new Set<string>();
      const outgoingCount = new Array(graph.nodes.length).fill(0);

      // First, convert existing edges to directed
      graph.edges.forEach(edge => {
        const from = typeof edge.from === 'number' ? edge.from : 0;
        const to = typeof edge.to === 'number' ? edge.to : 0;

        // Randomly decide direction for this edge
        const direction = Math.random() < 0.5;
        const directedFrom = direction ? from : to;
        const directedTo = direction ? to : from;

        const edgeKey = `${directedFrom}-${directedTo}`;

        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          directedEdges.push({
            from: directedFrom,
            to: directedTo,
            weight: edge.weight || 1,
            directed: true
          });
          outgoingCount[directedFrom]++;
        }
      });

      // Ensure every node (except possibly the last one) has at least one outgoing edge
      for (let i = 0; i < graph.nodes.length - 1; i++) {
        if (outgoingCount[i] === 0) {
          // Add a random outgoing edge from this node
          let targetNode;
          do {
            targetNode = Math.floor(Math.random() * graph.nodes.length);
          } while (targetNode === i);

          const edgeKey = `${i}-${targetNode}`;
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            directedEdges.push({
              from: i,
              to: targetNode,
              weight: Math.floor(Math.random() * 20) + 1,
              directed: true
            });
            outgoingCount[i]++;
          }
        }
      }

      // Also ensure the last node isn't a complete dead end (optional, but improves connectivity)
      if (outgoingCount[graph.nodes.length - 1] === 0 && graph.nodes.length > 2) {
        const targetNode = Math.floor(Math.random() * (graph.nodes.length - 1));
        directedEdges.push({
          from: graph.nodes.length - 1,
          to: targetNode,
          weight: Math.floor(Math.random() * 20) + 1,
          directed: true
        });
      }

      graph = {
        ...graph,
        edges: directedEdges,
        directed: true
      };
    }

    return graph;
  }, [numNodes, graphType, algorithm, regenerateTrigger]);

  // Convert to legacy format for visualization
  const [legacyNodes, setLegacyNodes] = useState<LegacyGraphNode[]>([]);

  useEffect(() => {
    setLegacyNodes(graphToLegacyNodes(unifiedGraph));
  }, [unifiedGraph]);

  // Generate algorithm steps
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(200);

  useEffect(() => {
    if (!unifiedGraph.nodes.length) return;

    // Check compatibility
    const { compatible, reason } = checkCompatibility(
      algorithm === 'prim' ? 'prim-mst' :
      algorithm === 'topo' ? 'topological-sort' :
      algorithm === 'bellman' ? 'bellman-ford' :
      algorithm,
      graphType
    );

    if (!compatible) {
      console.warn(`Incompatible combination: ${algorithm} with ${graphType}: ${reason}`);
      setSteps([]);
      return;
    }

    let generator: AlgorithmGenerator<any>;

    switch (algorithm) {
      case "prim": {
        // Use legacy implementation for now
        generator = primMSTSteps(legacyNodes);
        break;
      }
      case "topo": {
        // Create proper DAG nodes for topological sort
        const topoNodes = legacyNodes.map((node, idx) => {
          // Extract incoming and outgoing edges from the unified graph
          const incoming: number[] = [];
          const outgoing: number[] = [];

          // Get edges from unified graph
          unifiedGraph.edges.forEach(edge => {
            const fromIdx = typeof edge.from === 'number' ? edge.from : unifiedGraph.nodes.findIndex(n => n.id === edge.from);
            const toIdx = typeof edge.to === 'number' ? edge.to : unifiedGraph.nodes.findIndex(n => n.id === edge.to);

            if (fromIdx === idx) {
              outgoing.push(toIdx);
            } else if (toIdx === idx) {
              incoming.push(fromIdx);
            }
          });

          return {
            id: idx,
            label: idx.toString(),
            x: node.x,
            y: node.y,
            edges: node.edges,
            incoming,
            outgoing
          };
        });

        generator = topologicalSortSteps(topoNodes as any);
        break;
      }
      case "bellman": {
        // Create directed edges from the unified graph
        const edges: Array<{ from: number; to: number; weight: number }> = [];
        const edgeSet = new Set<string>();

        // Use edges from unified graph, but treat them as directed
        unifiedGraph.edges.forEach(edge => {
          const fromIdx = typeof edge.from === 'number' ? edge.from : 0;
          const toIdx = typeof edge.to === 'number' ? edge.to : 0;
          const edgeKey = `${fromIdx}-${toIdx}`;

          // Avoid duplicate edges
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({
              from: fromIdx,
              to: toIdx,
              weight: edge.weight || 1
            });
          }
        });

        generator = bellmanFordSteps(unifiedGraph.nodes.length, edges);
        break;
      }
      case "bfs": {
        if (useTargetSearch && targetNode !== null) {
          // Use new target-based search
          generator = bfsSearch(unifiedGraph, startNode, targetNode);
        } else {
          // Use legacy traversal
          generator = graphBFSSteps({
            nodes: unifiedGraph.nodes.map((n, i) => ({ id: i })),
            edges: []
          }, startNode);
        }
        break;
      }
      case "dfs": {
        if (useTargetSearch && targetNode !== null) {
          // Use new target-based search
          generator = dfsSearch(unifiedGraph, startNode, targetNode);
        } else {
          // Use legacy traversal
          generator = graphDFSSteps({
            nodes: unifiedGraph.nodes.map((n, i) => ({ id: i })),
            edges: []
          }, startNode);
        }
        break;
      }
      default:
        return;
    }

    setSteps(Array.from(generator));
    setStepIndex(0);
    setIsPlaying(false);
  }, [algorithm, unifiedGraph, useTargetSearch, targetNode, startNode]);

  useEffect(() => {
    if (!isPlaying) return;

    const id = window.setTimeout(() => {
      if (stepIndex < steps.length - 1) {
        setStepIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, speed);

    return () => clearTimeout(id);
  }, [isPlaying, stepIndex, steps, speed]);

  const currentStep = steps[stepIndex] || { type: "done", visited: [], frontier: [], node: 0 };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const step = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  };
  const reset = () => {
    setStepIndex(0);
    setIsPlaying(false);
  };

  const regenerate = () => {
    setStepIndex(0);
    setIsPlaying(false);
    setRegenerateTrigger(prev => prev + 1);
    // Generate new random target for traversal algorithms
    if (algorithm === 'bfs' || algorithm === 'dfs') {
      let randomTarget;
      do {
        randomTarget = Math.floor(Math.random() * numNodes);
      } while (randomTarget === startNode);
      setTargetNode(randomTarget);
    }
  };

  // Get compatible generators for current algorithm
  const compatibleGenerators = useMemo(() => {
    const algoKey = algorithm === 'prim' ? 'prim-mst' :
                   algorithm === 'topo' ? 'topological-sort' :
                   algorithm === 'bellman' ? 'bellman-ford' :
                   algorithm;
    return getCompatibleGenerators(algoKey);
  }, [algorithm]);

  return {
    algorithm,
    setAlgorithm,
    graphType,
    setGraphType,
    numNodes,
    setNumNodes,
    nodes: legacyNodes, // Legacy format for existing visualization
    currentStep,
    stepIndex,
    totalSteps: steps.length,
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
    unifiedGraph // New unified graph format
  };
}