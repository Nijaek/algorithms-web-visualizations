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
