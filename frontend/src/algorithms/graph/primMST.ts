import { GraphStep } from "../../types/algorithms";

interface GraphNode {
  x: number;
  y: number;
  edges: Array<{ to: number; weight: number }>;
}

export function* primMSTSteps(nodes: GraphNode[]): Generator<GraphStep, void, unknown> {
  if (nodes.length === 0) return;

  const n = nodes.length;
  const visited = new Set<number>();
  const mstEdges: Array<[number, number, number]> = [];
  const minEdge = new Array(n).fill(Infinity);
  const parent = new Array(n).fill(-1);

  // Start from node 0
  minEdge[0] = 0;

  for (let count = 0; count < n; count++) {
    // Find the minimum edge weight vertex not yet included
    let u = -1;
    let minWeight = Infinity;

    for (let v = 0; v < n; v++) {
      if (!visited.has(v) && minEdge[v] < minWeight) {
        u = v;
        minWeight = minEdge[v];
      }
    }

    if (u === -1) break;

    visited.add(u);
    yield { type: "visit", node: u };

    // Add edge to MST if not the first node
    if (parent[u] !== -1) {
      mstEdges.push([parent[u], u, minEdge[u]]);
      yield {
        type: "mst_edge",
        edges: [[parent[u], u]],
        weight: minEdge[u],
        mstEdges: [...mstEdges]
      };
    }

    // Update adjacent edges
    for (const edge of nodes[u].edges) {
      const v = edge.to;
      const weight = edge.weight;

      if (!visited.has(v) && weight < minEdge[v]) {
        minEdge[v] = weight;
        parent[v] = u;
        yield {
          type: "edge",
          node: u,
          edges: [[u, v]],
          weight
        };
      }
    }
  }

  yield {
    type: "done",
    mstEdges,
    node: visited.size
  };
}