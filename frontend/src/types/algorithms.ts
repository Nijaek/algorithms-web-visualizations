export type SortingStep =
  | { type: "compare"; indices: [number, number] }
  | { type: "swap"; indices: [number, number] }
  | { type: "overwrite"; index: number; value: number }
  | { type: "done"; array: number[] };

export type PathfindingStep = {
  visited: [number, number][];
  frontier: [number, number][];
  path: [number, number][];
};

export type KMeansStep = {
  centroids: { x: number; y: number }[];
  assignments: number[];
};

// Generic graph types
export interface GraphNode {
  id: string | number;
  value?: any;
}

export interface GraphEdge {
  from: string | number;
  to: string | number;
  weight?: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Grid position type for adapters
export interface GridPosition {
  row: number;
  col: number;
}

// Algorithm step types
export type GraphTraversalStep = {
  type: "visit" | "frontier" | "done";
  node: string | number;
  visited: (string | number)[];
  frontier: (string | number)[];
};

export type GraphStep = {
  type: "visit" | "edge" | "mst_edge" | "relax" | "topo_order" | "flow" | "done";
  node?: number;
  edges?: Array<[number, number]>;
  weight?: number;
  mstEdges?: Array<[number, number, number]>;
  distances?: number[];
  order?: number[];
  flow?: number;
  maxFlow?: number;
};
