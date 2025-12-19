import { KMeansStep } from "../../types/algorithms";

export type KMeansPoint = { x: number; y: number };

export const generatePoints = (count = 40): KMeansPoint[] =>
  Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random()
  }));

function nearestCentroid(point: KMeansPoint, centroids: KMeansPoint[]): number {
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  centroids.forEach((c, idx) => {
    const dist = (c.x - point.x) ** 2 + (c.y - point.y) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = idx;
    }
  });
  return best;
}

export function* kmeansSteps(
  points: KMeansPoint[],
  k = 3,
  iterations = 6
): Generator<KMeansStep, void, unknown> {
  let centroids = generatePoints(k);
  let assignments = new Array(points.length).fill(0);

  for (let iter = 0; iter < iterations; iter += 1) {
    assignments = points.map((p) => nearestCentroid(p, centroids));
    yield { centroids, assignments };

    const sums = Array.from({ length: k }, () => ({ x: 0, y: 0, count: 0 }));
    points.forEach((p, idx) => {
      const c = assignments[idx];
      sums[c].x += p.x;
      sums[c].y += p.y;
      sums[c].count += 1;
    });
    centroids = centroids.map((c, idx) => {
      const bucket = sums[idx];
      if (bucket.count === 0) return c;
      return { x: bucket.x / bucket.count, y: bucket.y / bucket.count };
    });
    yield { centroids, assignments };
  }

  yield { centroids, assignments };
}
