import { Graph, SearchStep } from '../types';

export function* bfsSearch(
  graph: Graph,
  start: string | number,
  target: string | number
): Generator<SearchStep, void, unknown> {
  const visited = new Set<string | number>();
  const frontier = [start];
  const predecessors = new Map<string | number, string | number>();
  let found = false;

  // Initialize search
  visited.add(start);
  yield {
    type: 'visit',
    node: start,
    target,
    visited: Array.from(visited),
    frontier,
    found: start === target,
    path: start === target ? [start] : []
  };

  if (start === target) {
    found = true;
    return;
  }

  // BFS loop
  while (frontier.length > 0 && !found) {
    const current = frontier.shift()!;

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

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        frontier.push(neighbor);
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
            frontier,
            found: true,
            path
          };
          return;
        }

        yield {
          type: 'frontier',
          node: neighbor,
          target,
          visited: Array.from(visited),
          frontier,
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
    frontier,
    found: false
  };
}