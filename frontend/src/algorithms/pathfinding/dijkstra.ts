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

export function* dijkstraSteps(
  rows = 12,
  cols = 18,
  start: Point = [0, 0],
  goal: Point = [rows - 1, cols - 1],
  walls: Set<string> = new Set()
): Generator<PathfindingStep, void, unknown> {

  const visited = new Set<string>();
  const parent = new Map<string, string | null>();
  parent.set(key(...start), null);

  const frontier: Array<{ point: Point; dist: number }> = [{ point: start, dist: 0 }];

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

  while (frontier.length) {
    frontier.sort((a, b) => a.dist - b.dist);
    const { point, dist } = frontier.shift()!;
    const id = key(...point);
    if (visited.has(id)) {
      continue;
    }
    visited.add(id);

    const currentPath = point[0] === goal[0] && point[1] === goal[1] ? buildPath(id) : [];
    yield {
      visited: Array.from(visited).map((k) => k.split(",").map(Number) as Point),
      frontier: frontier.map((f) => f.point),
      path: currentPath
    };

    if (point[0] === goal[0] && point[1] === goal[1]) {
      break;
    }

    for (const n of neighbors(rows, cols, point)) {
      if (walls.has(key(...n))) continue;
      const nid = key(...n);
      if (visited.has(nid)) continue;
      if (!frontier.find((f) => key(...f.point) === nid)) {
        parent.set(nid, id);
        frontier.push({ point: n, dist: dist + 1 });
      }
    }
  }

  yield {
    visited: Array.from(visited).map((k) => k.split(",").map(Number) as Point),
    frontier: [],
    path: buildPath(key(...goal))
  };
}
