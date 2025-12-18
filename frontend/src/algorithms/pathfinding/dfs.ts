import { PathfindingStep } from "../../types/algorithms";

type Point = [number, number];

const key = (r: number, c: number) => `${r},${c}`;

const neighbors = (rows: number, cols: number, [r, c]: Point): Point[] => {
  const deltas: Point[] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];
  return deltas
    .map(([dr, dc]) => [r + dr, c + dc] as Point)
    .filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);
};

export function* dfsSteps(
  rows = 12,
  cols = 18,
  start: Point = [0, 0],
  goal: Point = [rows - 1, cols - 1],
  walls: Set<string> = new Set()
): Generator<PathfindingStep, void, unknown> {
  const visited = new Set<string>();
  const parent = new Map<string, string | null>();
  const stack: Point[] = [];

  stack.push(start);
  parent.set(key(...start), null);

  const buildPath = (endKey: string): Point[] => {
    const path: Point[] = [];
    let cur: string | null = endKey;
    while (cur) {
      const [r, c] = cur.split(",").map(Number) as Point;
      path.push([r, c]);
      cur = parent.get(cur) ?? null;
    }
    return path.reverse();
  };

  while (stack.length > 0) {
    const point = stack.pop()!;
    const id = key(...point);

    if (visited.has(id)) {
      continue;
    }

    visited.add(id);

    const currentPath = point[0] === goal[0] && point[1] === goal[1] ? buildPath(id) : [];
    yield {
      visited: Array.from(visited).map((k) => k.split(",").map(Number) as Point),
      frontier: stack,
      path: currentPath
    };

    if (point[0] === goal[0] && point[1] === goal[1]) {
      break;
    }

    // Add neighbors to stack in reverse order to maintain consistent exploration
    const validNeighbors = neighbors(rows, cols, point).filter(
      n => !walls.has(key(...n)) && !visited.has(key(...n)) && !parent.has(key(...n))
    );

    for (let i = validNeighbors.length - 1; i >= 0; i--) {
      const n = validNeighbors[i];
      const nid = key(...n);
      parent.set(nid, id);
      stack.push(n);
    }
  }

  yield {
    visited: Array.from(visited).map((k) => k.split(",").map(Number) as Point),
    frontier: [],
    path: parent.has(key(...goal)) ? buildPath(key(...goal)) : []
  };
}