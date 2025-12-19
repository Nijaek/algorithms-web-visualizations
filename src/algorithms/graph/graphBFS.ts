import { Graph, GraphTraversalStep } from "../../types/algorithms";

export function* graphBFSSteps(
  graph: Graph,
  startId: string | number
): Generator<GraphTraversalStep, void, unknown> {
  const visited: (string | number)[] = [];
  const frontier: (string | number)[] = [startId];
  const adjacencyList = new Map<string | number, (string | number)[]>();

  // Build adjacency list from edges
  graph.nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });

  graph.edges.forEach(edge => {
    const neighbors = adjacencyList.get(edge.from) || [];
    neighbors.push(edge.to);
    adjacencyList.set(edge.from, neighbors);
  });

  while (frontier.length > 0) {
    const current = frontier.shift()!;

    if (visited.includes(current)) {
      continue;
    }

    visited.push(current);

    yield {
      type: "visit",
      node: current,
      visited: [...visited],
      frontier: [...frontier]
    };

    // Add neighbors to frontier
    const neighbors = adjacencyList.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.includes(neighbor) && !frontier.includes(neighbor)) {
        frontier.push(neighbor);
      }
    }
  }

  yield {
    type: "done",
    node: startId,
    visited,
    frontier: []
  };
}