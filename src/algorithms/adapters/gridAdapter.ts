import { Graph, GraphNode, GraphEdge, GridPosition } from "../../types/algorithms";

export function gridToGraph(
  rows: number,
  cols: number,
  walls: Set<string>
): { graph: Graph; nodeToGrid: Map<string | number, GridPosition>; gridToNode: Map<string, string | number> } {
  const graph: Graph = { nodes: [], edges: [] };
  const nodeToGrid = new Map<string | number, GridPosition>();
  const gridToNode = new Map<string, string | number>();

  // Create nodes for each non-wall cell
  let nodeId = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const gridKey = `${row},${col}`;
      if (!walls.has(gridKey)) {
        const nodeIdStr = `n${nodeId++}`;
        graph.nodes.push({ id: nodeIdStr });
        nodeToGrid.set(nodeIdStr, { row, col });
        gridToNode.set(gridKey, nodeIdStr);
      }
    }
  }

  // Create edges between adjacent cells
  graph.nodes.forEach(node => {
    const pos = nodeToGrid.get(node.id)!;
    const { row, col } = pos;

    // Check all 4 directions
    const directions = [
      [-1, 0], // up
      [1, 0],  // down
      [0, -1], // left
      [0, 1]   // right
    ];

    directions.forEach(([dr, dc]) => {
      const newRow = row + dr;
      const newCol = col + dc;
      const newKey = `${newRow},${newCol}`;

      if (gridToNode.has(newKey)) {
        graph.edges.push({
          from: node.id,
          to: gridToNode.get(newKey)!,
          weight: 1
        });
      }
    });
  });

  return { graph, nodeToGrid, gridToNode };
}

export function graphToGridPath(
  path: (string | number)[],
  nodeToGrid: Map<string | number, GridPosition>
): [number, number][] {
  return path
    .map(nodeId => {
      const pos = nodeToGrid.get(nodeId);
      return pos ? [pos.row, pos.col] : null;
    })
    .filter((pos): pos is [number, number] => pos !== null);
}

export function graphToGridVisited(
  visited: (string | number)[],
  nodeToGrid: Map<string | number, GridPosition>
): [number, number][] {
  return graphToGridPath(visited, nodeToGrid);
}

export function graphToGridFrontier(
  frontier: (string | number)[],
  nodeToGrid: Map<string | number, GridPosition>
): [number, number][] {
  return graphToGridPath(frontier, nodeToGrid);
}