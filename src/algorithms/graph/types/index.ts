// Core unified graph types
export interface GraphNode {
  id: string | number;
  label?: string;
  position?: { x: number; y: number }; // Optional for spatial algorithms
  data?: any; // For algorithm-specific data
}

export interface GraphEdge {
  from: string | number;
  to: string | number;
  weight?: number; // For weighted algorithms
  directed?: boolean; // For directed/undirected graphs
  data?: any;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed?: boolean;
  weighted?: boolean;
}

// Algorithm-specific graph constraints
export interface WeightedGraph extends Graph {
  weighted: true;
  edges: Array<GraphEdge & { weight: number }>;
}

export interface DirectedGraph extends Graph {
  directed: true;
  edges: Array<GraphEdge & { directed: true }>;
}

export interface SpatialGraph extends Graph {
  nodes: Array<GraphNode & { position: { x: number; y: number } }>;
}

// Graph generator types
export type GraphGeneratorType =
  | 'complete'
  | 'tree'
  | 'dag'
  | 'weighted-random'
  | 'grid'
  | 'custom';

export interface GraphGenerator {
  type: GraphGeneratorType;
  numNodes: number;
  weighted?: boolean;
  directed?: boolean;
  // Additional parameters specific to generator type
  [key: string]: any;
}

// Algorithm requirements for graph generators
export interface AlgorithmRequirements {
  // Required properties
  requiresDirected?: boolean;
  requiresWeighted?: boolean;
  requiresAcyclic?: boolean;
  requiresConnected?: boolean;

  // Supported features
  supportsTargets?: boolean;

  // Incompatible generator types
  incompatibleGenerators?: GraphGeneratorType[];
}

// Algorithm categories
export type AlgorithmCategory =
  | 'traversal'
  | 'pathfinding'
  | 'optimization'
  | 'ordering';

// Step types for different algorithm categories
export interface TraversalStep {
  type: "visit" | "frontier" | "backtrack";
  node: string | number;
  visited: (string | number)[];
  frontier: (string | number)[];
  depth?: number; // For DFS depth tracking
}

export interface SearchStep extends Omit<TraversalStep, "type"> {
  type: "visit" | "frontier" | "found" | "not_found";
  target: string | number;
  path?: (string | number)[]; // Path from start to current
  found?: boolean; // Success flag
}

export interface PathfindingStep {
  type: "visit" | "frontier" | "goal_found" | "no_path";
  node: string | number;
  start: string | number;
  goal: string | number;
  visited: (string | number)[];
  frontier: (string | number)[];
  distances?: Map<string | number, number>;
  path?: (string | number)[];
  goalFound?: boolean;
}

export interface OptimizationStep {
  type: "visit" | "edge_consider" | "edge_select" | "update" | "complete";
  node?: string | number;
  edges?: Array<[string | number, string | number]>;
  selectedEdges?: Array<[string | number, string | number, number]>;
  cost?: number;
  totalCost?: number;
  state?: Map<string | number, any>;
}

export interface ShortestPathStep extends OptimizationStep {
  distances?: Map<string | number, number>;
  predecessors?: Map<string | number, string | number>;
}

export interface OrderingStep {
  type: "visit" | "process" | "cycle_detected" | "complete";
  node: string | number;
  order: (string | number)[];
  processed: (string | number)[];
  cycle?: (string | number)[];
  inDegrees?: Map<string | number, number>;
}

// Union type for all algorithm steps
export type AlgorithmStep =
  | TraversalStep
  | SearchStep
  | PathfindingStep
  | OptimizationStep
  | ShortestPathStep
  | OrderingStep;

// Generator functions return different step types based on algorithm
export type AlgorithmGenerator<T extends AlgorithmStep = AlgorithmStep> = Generator<T, void, unknown>;

// Backward compatibility types for existing code
export interface LegacyGraphNode {
  x: number;
  y: number;
  label: string;
  edges: Array<{ to: number; weight: number }>;
  outgoing?: number[];
  incoming?: number[];
}

export interface WeightedEdge {
  from: number;
  to: number;
  weight: number;
}

export interface GraphStep {
  type: string;
  node?: number;
  visited?: number[];
  frontier?: number[];
  distances?: number[];
  mstEdges?: Array<[number, number]>;
  edges?: Array<[number, number]>;
  order?: number[];
}

export interface GraphTraversalStep {
  visited: number[];
  frontier: number[];
}