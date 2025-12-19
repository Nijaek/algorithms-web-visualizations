import { Graph, SearchStep } from '../types';

export function* dfsSearch(
  graph: Graph,
  start: string | number,
  target: string | number
): Generator<SearchStep, void, unknown> {
  const visited = new Set<string | number>();
  const stack: Array<{ node: string | number; depth: number }> = [];
  const predecessors = new Map<string | number, string | number>();
  let found = false;

  // Initial step - show clean state before search begins
  yield {
    type: 'visit',
    node: start,
    target,
    visited: [],
    frontier: [],
    depth: 0,
    found: false,
    path: []
  };

  // Start the search - add start node
  visited.add(start);
  stack.push({ node: start, depth: 0 });
  yield {
    type: 'visit',
    node: start,
    target,
    visited: Array.from(visited),
    frontier: stack.map(s => s.node),
    depth: 0,
    found: start === target,
    path: start === target ? [start] : []
  };

  if (start === target) {
    found = true;
    return;
  }

  // DFS loop
  while (stack.length > 0 && !found) {
    const { node: current, depth } = stack.pop()!;

    // Get neighbors based on graph edge structure
    const neighbors: (string | number)[] = [];

    if (graph.directed) {
      // For directed graphs, follow outgoing edges
      graph.edges
        .filter(edge => edge.from === current)
        .forEach(edge => neighbors.push(edge.to));
    } else {
      // For undirected graphs, check both directions
      graph.edges
        .filter(edge => edge.from === current || edge.to === current)
        .forEach(edge => {
          const neighbor = edge.from === current ? edge.to : edge.from;
          neighbors.push(neighbor);
        });
    }

    // Visit neighbors (reverse order for more predictable DFS)
    neighbors.reverse();

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        predecessors.set(neighbor, current);

        // Check if we found the target
        if (neighbor === target) {
          found = true;

          // Reconstruct path
          const path: (string | number)[] = [];
          let node: string | number | undefined = neighbor;
          while (node !== undefined) {
            path.unshift(node);
            node = predecessors.get(node);
          }

          yield {
            type: 'found',
            node: neighbor,
            target,
            visited: Array.from(visited),
            frontier: stack.map(s => s.node),
            depth: depth + 1,
            found: true,
            path
          };
          return;
        }

        stack.push({ node: neighbor, depth: depth + 1 });

        yield {
          type: 'frontier',
          node: neighbor,
          target,
          visited: Array.from(visited),
          frontier: stack.map(s => s.node),
          depth: depth + 1,
          found: false
        };
      }
    }
  }

  // Target not found
  yield {
    type: 'not_found',
    node: start,
    target,
    visited: Array.from(visited),
    frontier: [],
    found: false
  };
}