import { PathfindingStep } from "../../types/algorithms";

type Point = [number, number];

const key = (r: number, c: number) => `${r},${c}`;

const neighbors = (rows: number, cols: number, [r, c]: Point): Point[] =>
  [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ]
    .map(([dr, dc]) => [r + dr, c + dc] as Point)
    .filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);

const h = ([r, c]: Point, [gr, gc]: Point) => Math.abs(r - gr) + Math.abs(c - gc);

export function* aStarSteps(
  rows = 12,
  cols = 18,
  start: Point = [0, 0],
  goal: Point = [rows - 1, cols - 1],
  walls: Set<string> = new Set()
): Generator<PathfindingStep, void, unknown> {
  const open: Array<{ point: Point; g: number; f: number }> = [{ point: start, g: 0, f: h(start, goal) }];
  const gScore = new Map<string, number>([[key(...start), 0]]);
  const parent = new Map<string, string | null>([[key(...start), null]]);
  const visited = new Set<string>();

  const buildPath = (end: string): Point[] => {
    const path: Point[] = [];
    let cur: string | null = end;
    while (cur) {
      const [r, c] = cur.split(",").map(Number) as Point;
      path.push([r, c]);
      cur = parent.get(cur) ?? null;
    }
    return path.reverse();
  };

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const { point, g } = open.shift()!;
    const id = key(...point);
    if (visited.has(id)) continue;
    visited.add(id);

    const currentPath = id === key(...goal) ? buildPath(id) : [];
    yield {
      visited: Array.from(visited).map((k) => k.split(",").map(Number) as Point),
      frontier: open.map((o) => o.point),
      path: currentPath
    };
    if (id === key(...goal)) break;

    for (const n of neighbors(rows, cols, point)) {
      const nid = key(...n);
      if (walls.has(nid)) continue;
      if (visited.has(nid)) continue;
      const tentativeG = g + 1;
      const bestG = gScore.get(nid);
      if (bestG !== undefined && tentativeG >= bestG) continue;
      parent.set(nid, id);
      gScore.set(nid, tentativeG);
      open.push({ point: n, g: tentativeG, f: tentativeG + h(n, goal) });
    }
  }

  yield {
    visited: Array.from(visited).map((k) => k.split(",").map(Number) as Point),
    frontier: [],
    path: parent.has(key(...goal)) ? buildPath(key(...goal)) : []
  };
}
