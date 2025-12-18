import { GraphStep } from "../../types/algorithms";

interface WeightedEdge {
  from: number;
  to: number;
  weight: number;
}

export function* bellmanFordSteps(
  numNodes: number,
  edges: WeightedEdge[],
  source: number = 0
): Generator<GraphStep, void, unknown> {
  const distances = new Array(numNodes).fill(Infinity);
  distances[source] = 0;
  const parent = new Array(numNodes).fill(-1);

  yield {
    type: "visit",
    node: source,
    distances: [...distances]
  };

  // Relax edges V-1 times
  for (let i = 0; i < numNodes - 1; i++) {
    let updated = false;

    for (const edge of edges) {
      const { from, to, weight } = edge;

      if (distances[from] !== Infinity && distances[from] + weight < distances[to]) {
        distances[to] = distances[from] + weight;
        parent[to] = from;
        updated = true;

        yield {
          type: "relax",
          node: to,
          edges: [[from, to]],
          weight,
          distances: [...distances]
        };
      }
    }

    if (!updated) break;
  }

  // Check for negative weight cycles
  for (const edge of edges) {
    const { from, to, weight } = edge;

    if (distances[from] !== Infinity && distances[from] + weight < distances[to]) {
      // Negative cycle detected
      yield {
        type: "done",
        node: -1,
        distances: [...distances]
      };
      return;
    }
  }

  yield {
    type: "done",
    node: numNodes,
    distances: [...distances]
  };
}