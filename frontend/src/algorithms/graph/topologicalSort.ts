import { GraphStep } from "../../types/algorithms";

interface DirectedGraphNode {
  id: number;
  label: string;
  outgoing: number[];
  incoming: number[];
}

export function* topologicalSortSteps(nodes: DirectedGraphNode[]): Generator<GraphStep, void, unknown> {
  const n = nodes.length;
  const inDegree = new Array(n).fill(0);
  const result: number[] = [];
  const visited = new Set<number>();

  // Calculate in-degrees
  for (let i = 0; i < n; i++) {
    inDegree[i] = nodes[i].incoming.length;
  }

  // Queue for nodes with no incoming edges
  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
      yield { type: "visit", node: i };
    }
  }

  while (queue.length > 0) {
    const u = queue.shift()!;
    result.push(u);
    visited.add(u);

    yield {
      type: "topo_order",
      node: u,
      order: [...result]
    };

    // Update in-degrees of neighbors
    for (const v of nodes[u].outgoing) {
      inDegree[v]--;

      yield {
        type: "edge",
        node: u,
        edges: [[u, v]]
      };

      if (inDegree[v] === 0 && !visited.has(v)) {
        queue.push(v);
        yield { type: "visit", node: v };
      }
    }
  }

  // Check for cycle
  if (result.length !== n) {
    // Graph has a cycle
    yield {
      type: "done",
      node: -1,
      order: result
    };
  } else {
    yield {
      type: "done",
      node: result.length,
      order: result
    };
  }
}